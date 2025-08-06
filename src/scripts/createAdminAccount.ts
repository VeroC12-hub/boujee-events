// =====================================================
// createAdminAccount.ts - Complete Admin Account Creation Script
// Save this as src/scripts/createAdminAccount.ts
// =====================================================

import { supabase } from '../lib/supabase';

// Admin account configuration
interface AdminAccountData {
  email: string;
  password: string;
  fullName: string;
}

// Response interface
interface AdminCreationResponse {
  success: boolean;
  userId?: string;
  email?: string;
  password?: string;
  profile?: any;
  error?: string;
}

async function createFirstAdmin(): Promise<AdminCreationResponse> {
  console.log('🔄 Creating first admin account...');
  
  const adminData: AdminAccountData = {
    email: 'admin@boujeeevents.com',  // ⚠️ Change this to your email
    password: 'Admin123!Secure',       // ⚠️ Change this to secure password  
    fullName: 'Boujee Events Admin'    // ⚠️ Change this to your name
  };

  try {
    // Step 1: Check if admin already exists
    console.log('🔍 Checking if admin already exists...');
    const { data: existingAdmin, error: checkError } = await supabase
      .from('user_profiles')
      .select('email, role')
      .eq('email', adminData.email)
      .eq('role', 'admin')
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking existing admin:', checkError.message);
      return { success: false, error: checkError.message };
    }

    if (existingAdmin) {
      console.log('⚠️ Admin with this email already exists');
      return { 
        success: false, 
        error: 'Admin account already exists with this email' 
      };
    }

    // Step 2: Create user in Supabase Auth
    console.log('📧 Creating auth user...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: adminData.email,
      password: adminData.password,
      options: {
        data: {
          full_name: adminData.fullName,
        },
        emailRedirectTo: undefined // Skip email confirmation for admin
      }
    });

    if (authError) {
      console.error('❌ Auth creation failed:', authError.message);
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      console.error('❌ No user created');
      return { success: false, error: 'No user created in auth system' };
    }

    const userId = authData.user.id;
    console.log('✅ Auth user created:', userId);

    // Step 3: Wait a moment for auth to settle
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 4: Create admin profile in your database
    console.log('👤 Creating admin profile...');
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        email: adminData.email,
        full_name: adminData.fullName,
        role: 'admin',
        status: 'approved', // Pre-approved since this is first admin
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Profile creation failed:', profileError.message);
      // Try to clean up auth user if profile creation fails
      try {
        await supabase.auth.admin.deleteUser(userId);
        console.log('🧹 Cleaned up auth user after profile failure');
      } catch (cleanupError) {
        console.error('⚠️ Failed to cleanup auth user:', cleanupError);
      }
      return { success: false, error: profileError.message };
    }

    console.log('✅ Admin profile created:', profileData);

    // Step 5: Create admin settings
    console.log('⚙️ Creating admin settings...');
    const { error: settingsError } = await supabase
      .from('user_settings')
      .insert({
        user_id: userId,
        email_notifications: true,
        sms_notifications: false,
        marketing_emails: false,
        theme_preference: 'dark',
        language: 'en',
        timezone: 'UTC'
      });

    if (settingsError) {
      console.error('⚠️ Settings creation failed:', settingsError.message);
      // Don't return - this is not critical for admin functionality
    } else {
      console.log('✅ Admin settings created');
    }

    // Step 6: Verify admin access
    console.log('🔍 Verifying admin access...');
    const { data: verification, error: verificationError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .eq('role', 'admin')
      .eq('status', 'approved')
      .single();

    if (verificationError || !verification) {
      console.error('❌ Admin verification failed');
      return { 
        success: false, 
        error: 'Admin verification failed after creation' 
      };
    }

    // Step 7: Initialize system settings if they don't exist
    console.log('🔧 Ensuring system settings exist...');
    const defaultSettings = [
      { key: 'site_name', value: 'Boujee Events', type: 'string', description: 'Site name', is_public: true },
      { key: 'site_description', value: 'Creating magical moments', type: 'string', description: 'Site tagline', is_public: true },
      { key: 'contact_email', value: adminData.email, type: 'string', description: 'Contact email', is_public: true },
      { key: 'max_event_capacity', value: '500', type: 'number', description: 'Maximum event capacity', is_public: false },
      { key: 'booking_fee_percentage', value: '5', type: 'number', description: 'Booking fee percentage', is_public: false },
      { key: 'auto_approve_organizers', value: 'false', type: 'boolean', description: 'Auto-approve organizer applications', is_public: false },
      { key: 'maintenance_mode', value: 'false', type: 'boolean', description: 'Site maintenance mode', is_public: false }
    ];

    for (const setting of defaultSettings) {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          setting_key: setting.key,
          setting_value: setting.value,
          setting_type: setting.type,
          description: setting.description,
          is_public: setting.is_public,
          updated_by: userId
        }, {
          onConflict: 'setting_key',
          ignoreDuplicates: true
        });

      if (error) {
        console.warn(`⚠️ Failed to create setting ${setting.key}:`, error.message);
      }
    }

    console.log('✅ System settings initialized');

    console.log('🎉 SUCCESS! Admin account created successfully!');
    console.log('================================');
    console.log('📧 Email:', adminData.email);
    console.log('🔐 Password:', adminData.password);
    console.log('👤 Name:', adminData.fullName);
    console.log('🔑 Role:', verification.role);
    console.log('✅ Status:', verification.status);
    console.log('🆔 User ID:', userId);
    console.log('================================');
    console.log('🌐 Login URL: https://boujee-events.vercel.app/login');
    console.log('🚀 Admin Dashboard: https://boujee-events.vercel.app/admin-dashboard');
    console.log('================================');
    console.log('⚠️  IMPORTANT: Change the default password after first login!');
    
    return {
      success: true,
      userId,
      email: adminData.email,
      password: adminData.password,
      profile: verification
    };

  } catch (error: any) {
    console.error('💥 Unexpected error:', error);
    return { 
      success: false, 
      error: error.message || 'Unknown error occurred' 
    };
  }
}

// Alternative: Create admin with custom details
async function createCustomAdmin(
  email: string,
  password: string, 
  fullName: string
): Promise<AdminCreationResponse> {
  console.log(`🔄 Creating custom admin: ${email}`);
  
  // Validate input parameters
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Invalid email address' };
  }

  if (!password || password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters long' };
  }

  if (!fullName || fullName.trim().length < 2) {
    return { success: false, error: 'Full name must be at least 2 characters long' };
  }

  const adminData: AdminAccountData = {
    email: email.toLowerCase().trim(),
    password,
    fullName: fullName.trim()
  };

  try {
    // Step 1: Check if admin already exists
    console.log('🔍 Checking if admin already exists...');
    const { data: existingAdmin, error: checkError } = await supabase
      .from('user_profiles')
      .select('email, role')
      .eq('email', adminData.email)
      .eq('role', 'admin')
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking existing admin:', checkError.message);
      return { success: false, error: checkError.message };
    }

    if (existingAdmin) {
      console.log('⚠️ Admin with this email already exists');
      return { 
        success: false, 
        error: 'Admin account already exists with this email' 
      };
    }

    // Step 2: Create user in Supabase Auth
    console.log('📧 Creating auth user...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: adminData.email,
      password: adminData.password,
      options: {
        data: {
          full_name: adminData.fullName,
        },
        emailRedirectTo: undefined
      }
    });

    if (authError) {
      console.error('❌ Auth creation failed:', authError.message);
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      console.error('❌ No user created');
      return { success: false, error: 'No user created in auth system' };
    }

    const userId = authData.user.id;
    console.log('✅ Auth user created:', userId);

    // Step 3: Wait for auth to settle
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 4: Create admin profile
    console.log('👤 Creating admin profile...');
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        email: adminData.email,
        full_name: adminData.fullName,
        role: 'admin',
        status: 'approved',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Profile creation failed:', profileError.message);
      try {
        await supabase.auth.admin.deleteUser(userId);
        console.log('🧹 Cleaned up auth user after profile failure');
      } catch (cleanupError) {
        console.error('⚠️ Failed to cleanup auth user:', cleanupError);
      }
      return { success: false, error: profileError.message };
    }

    console.log('✅ Admin profile created:', profileData);

    // Step 5: Create admin settings
    console.log('⚙️ Creating admin settings...');
    const { error: settingsError } = await supabase
      .from('user_settings')
      .insert({
        user_id: userId,
        email_notifications: true,
        sms_notifications: false,
        marketing_emails: false,
        theme_preference: 'dark',
        language: 'en',
        timezone: 'UTC'
      });

    if (settingsError) {
      console.error('⚠️ Settings creation failed:', settingsError.message);
    } else {
      console.log('✅ Admin settings created');
    }

    // Step 6: Verify admin access
    console.log('🔍 Verifying admin access...');
    const { data: verification, error: verificationError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .eq('role', 'admin')
      .eq('status', 'approved')
      .single();

    if (verificationError || !verification) {
      console.error('❌ Admin verification failed');
      return { 
        success: false, 
        error: 'Admin verification failed after creation' 
      };
    }

    console.log('🎉 SUCCESS! Custom admin account created successfully!');
    console.log('================================');
    console.log('📧 Email:', adminData.email);
    console.log('🔐 Password:', adminData.password);
    console.log('👤 Name:', adminData.fullName);
    console.log('🔑 Role:', verification.role);
    console.log('✅ Status:', verification.status);
    console.log('🆔 User ID:', userId);
    console.log('================================');
    
    return {
      success: true,
      userId,
      email: adminData.email,
      password: adminData.password,
      profile: verification
    };

  } catch (error: any) {
    console.error('💥 Unexpected error:', error);
    return { 
      success: false, 
      error: error.message || 'Unknown error occurred' 
    };
  }
}

// Function to list all admins
async function listAdmins(): Promise<void> {
  console.log('🔍 Listing all admin accounts...');
  
  try {
    const { data: admins, error } = await supabase
      .from('user_profiles')
      .select('id, email, full_name, role, status, created_at')
      .eq('role', 'admin')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Failed to fetch admins:', error.message);
      return;
    }

    if (!admins || admins.length === 0) {
      console.log('📭 No admin accounts found');
      return;
    }

    console.log(`👥 Found ${admins.length} admin account(s):`);
    console.log('================================');
    
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.full_name || 'No Name'}`);
      console.log(`   📧 Email: ${admin.email}`);
      console.log(`   🆔 ID: ${admin.id}`);
      console.log(`   ✅ Status: ${admin.status}`);
      console.log(`   📅 Created: ${new Date(admin.created_at).toLocaleDateString()}`);
      console.log('   ---');
    });
    
  } catch (error: any) {
    console.error('💥 Unexpected error:', error);
  }
}

// Function to delete admin (use with caution!)
async function deleteAdmin(email: string): Promise<AdminCreationResponse> {
  console.log(`⚠️  Attempting to delete admin: ${email}`);
  
  if (!email) {
    return { success: false, error: 'Email is required' };
  }

  try {
    // First, get the admin user
    const { data: admin, error: fetchError } = await supabase
      .from('user_profiles')
      .select('id, email, role')
      .eq('email', email.toLowerCase().trim())
      .eq('role', 'admin')
      .single();

    if (fetchError || !admin) {
      console.error('❌ Admin not found');
      return { success: false, error: 'Admin account not found' };
    }

    // Delete from auth (this will cascade to user_profiles due to foreign key)
    const { error: authError } = await supabase.auth.admin.deleteUser(admin.id);
    
    if (authError) {
      console.error('❌ Failed to delete admin from auth:', authError.message);
      return { success: false, error: authError.message };
    }

    console.log('✅ Admin account deleted successfully');
    return { success: true };
    
  } catch (error: any) {
    console.error('💥 Unexpected error:', error);
    return { 
      success: false, 
      error: error.message || 'Unknown error occurred' 
    };
  }
}

// Runtime execution logic
if (typeof window === 'undefined') {
  // Running in Node.js environment
  console.log('🚀 Running admin creation script...');
  createFirstAdmin().then(result => {
    if (result.success) {
      console.log('🎊 Script completed successfully!');
      process.exit(0);
    } else {
      console.error('💥 Script failed:', result.error);
      process.exit(1);
    }
  });
} else {
  // Running in browser - make functions available globally
  (window as any).createFirstAdmin = createFirstAdmin;
  (window as any).createCustomAdmin = createCustomAdmin;
  (window as any).listAdmins = listAdmins;
  (window as any).deleteAdmin = deleteAdmin;
  
  console.log('🔧 Admin management functions available:');
  console.log('   📝 createFirstAdmin() - Create default admin');
  console.log('   👤 createCustomAdmin(email, password, fullName) - Create custom admin');
  console.log('   📋 listAdmins() - List all admin accounts');
  console.log('   🗑️  deleteAdmin(email) - Delete admin account (use with caution!)');
}

// Export functions for use in other modules
export { 
  createFirstAdmin, 
  createCustomAdmin, 
  listAdmins, 
  deleteAdmin,
  type AdminAccountData,
  type AdminCreationResponse 
};

// Enhanced CSV Export with better formatting
export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) {
    if ((window as any).toast) {
      (window as any).toast.error('No data to export');
    }
    return;
  }
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle different data types
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');
  
  // Add BOM for proper Excel encoding
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Enhanced JSON Export
export const exportToJSON = (data: any, filename: string) => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const link = document.createElement('a');
  
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().slice(0, 10)}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Enhanced HTML Report Export with better styling
export const exportHTMLReport = (
  title: string,
  sections: Array<{
    title: string;
    content: string;
    data?: any[];
  }>,
  filename: string
) => {
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>${title}</title>
    <meta charset="UTF-8">
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
            margin: 40px; 
            color: #1f2937; 
            background: #f9fafb; 
        }
        .container { background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        h1 { 
            color: #1f2937; 
            border-bottom: 3px solid #3b82f6; 
            padding-bottom: 15px; 
            margin-bottom: 30px;
            font-size: 2.5rem;
        }
        h2 { 
            color: #374151; 
            margin-top: 40px; 
            margin-bottom: 20px;
            font-size: 1.5rem;
            border-left: 4px solid #3b82f6;
            padding-left: 15px;
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white;
            padding: 30px; 
            border-radius: 12px; 
            margin-bottom: 40px; 
        }
        .header h1 { border: none; color: white; margin: 0; }
        .header-info { margin-top: 15px; opacity: 0.9; }
        .section { margin-bottom: 40px; }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px; 
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        th, td { 
            border: 1px solid #e5e7eb; 
            padding: 15px; 
            text-align: left; 
        }
        th { 
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); 
            font-weight: 600; 
            color: #374151;
        }
        tr:nth-child(even) { background-color: #f9fafb; }
        tr:hover { background-color: #f3f4f6; }
        .metric { 
            display: inline-block; 
            margin: 15px 25px 15px 0; 
            padding: 20px; 
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); 
            border-radius: 12px; 
            min-width: 180px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .metric-value { 
            font-size: 2rem; 
            font-weight: 700; 
            color: #1d4ed8; 
            margin-bottom: 5px;
        }
        .metric-label { 
            font-size: 14px; 
            color: #6b7280; 
            font-weight: 500;
        }
        .footer { 
            margin-top: 60px; 
            padding: 25px; 
            background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); 
            border-radius: 12px; 
            font-size: 13px; 
            color: #6b7280; 
            border-top: 1px solid #e5e7eb;
        }
        .logo { 
            font-size: 24px; 
            font-weight: bold; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
        }
        @media print {
            body { margin: 0; background: white; }
            .container { box-shadow: none; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🌟 EventHub Analytics</div>
            <h1>${title}</h1>
            <div class="header-info">
                <p><strong>📅 Generated:</strong> ${new Date().toLocaleString()} UTC</p>
                <p><strong>👤 User:</strong> VeroC12-hub</p>
                <p><strong>🏢 Platform:</strong> EventHub Management System</p>
            </div>
        </div>
        
        ${sections.map(section => `
            <div class="section">
                <h2>${section.title}</h2>
                <div>${section.content}</div>
                ${section.data && section.data.length > 0 ? `
                    <table>
                        <thead>
                            <tr>
                                ${Object.keys(section.data[0]).map(key => `<th>${key}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${section.data.map(row => `
                                <tr>
                                    ${Object.values(row).map(value => `<td>${value}</td>`).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                ` : ''}
            </div>
        `).join('')}
        
        <div class="footer">
            <p><strong>📊 EventHub Analytics System</strong></p>
            <p>This comprehensive report was automatically generated by the EventHub platform.</p>
            <p><strong>Report Details:</strong></p>
            <ul>
                <li>Report ID: ${Date.now()}</li>
                <li>Generation Time: ${new Date().toISOString()}</li>
                <li>User: VeroC12-hub</li>
                <li>Export Format: HTML</li>
            </ul>
            <p><em>© 2025 EventHub - Advanced Event Management Platform</em></p>
        </div>
    </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().slice(0, 10)}.html`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Enhanced Print Report
export const printReport = (content: string, title: string) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    if ((window as any).toast) {
      (window as any).toast.error('Please allow popups to print reports');
    }
    return;
  }
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>${title}</title>
        <meta charset="UTF-8">
        <style>
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                margin: 20px; 
                color: #1f2937;
            }
            h1 { color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
            h2 { color: #374151; margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { border: 1px solid #d1d5db; padding: 10px; text-align: left; }
            th { background-color: #f3f4f6; font-weight: 600; }
            @media print {
                body { margin: 0; }
                .no-print { display: none; }
                h1 { color: #000 !important; }
                h2 { color: #333 !important; }
            }
        </style>
    </head>
    <body>
        <div style="text-align: center; margin-bottom: 30px;">
            <h1>🌟 ${title}</h1>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()} UTC | <strong>User:</strong> VeroC12-hub</p>
        </div>
        ${content}
        <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #6b7280;">
            <p>This report was generated by EventHub Analytics System</p>
        </div>
    </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};

// New: Export Goals to CSV
export const exportGoalsToCSV = (goals: any[]) => {
  const goalsData = goals.map(goal => ({
    'Goal Name': goal.name,
    'Type': goal.type,
    'Target': goal.target,
    'Current': goal.current,
    'Progress (%)': ((goal.current / goal.target) * 100).toFixed(1),
    'Status': goal.status,
    'Deadline': goal.deadline,
    'Days Left': Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
    'Created': goal.createdAt,
    'Description': goal.description || ''
  }));
  
  exportToCSV(goalsData, 'goals-tracking');
};

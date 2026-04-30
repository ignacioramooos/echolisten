// Script to generate Supabase types by fetching schema from REST API
const https = require('https');
const fs = require('fs');

const PROJECT_ID = 'msgfegcdtuvemblajoou';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zZ2ZlZ2NkdHV2ZW1ibGFqb291Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNTcwMjksImV4cCI6MjA4OTkzMzAyOX0.Yt1fm9w45OAl3ropZFGJvlLsh-Za8OP9UBKyLwy8ZUI';

function fetchSchema() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: `${PROJECT_ID}.supabase.co`,
      port: 443,
      path: '/rest/v1/?apikey=' + API_KEY,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const schema = JSON.parse(data);
          resolve(schema);
        } catch (e) {
          reject(`Failed to parse response: ${e.message}`);
        }
      });
    }).on('error', reject).end();
  });
}

async function main() {
  try {
    console.log('Fetching schema from Supabase...');
    const schema = await fetchSchema();
    console.log('Schema fetched. Tables found:', Object.keys(schema.definitions || {}).length);
    
    // Generate basic type definition
    const typeContent = generateTypes(schema);
    fs.writeFileSync('./src/integrations/supabase/types.ts', typeContent);
    console.log('✅ Types generated at src/integrations/supabase/types.ts');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

function generateTypes(schema) {
  const definitions = schema.definitions || {};
  
  let content = `export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
`;

  const tables = Object.keys(definitions).filter(k => definitions[k].properties);
  
  tables.forEach((tableName, idx) => {
    const def = definitions[tableName];
    const props = def.properties || {};
    
    content += `      ${tableName}: {
        Row: {
`;
    
    Object.entries(props).forEach(([col, colDef]) => {
      const type = getTypeFromDef(colDef);
      content += `          ${col}: ${type}\n`;
    });
    
    content += `        }
        Insert: {
`;
    
    Object.entries(props).forEach(([col, colDef]) => {
      const type = getTypeFromDef(colDef, true);
      content += `          ${col}?: ${type}\n`;
    });
    
    content += `        }
        Update: {
`;
    
    Object.entries(props).forEach(([col, colDef]) => {
      const type = getTypeFromDef(colDef, true);
      content += `          ${col}?: ${type}\n`;
    });
    
    content += `        }
        Relationships: []
      }`;
    
    if (idx < tables.length - 1) content += '\n';
  });

  content += `
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}`;

  return content;
}

function getTypeFromDef(def, nullable = false) {
  let type = 'unknown';
  
  if (def.type === 'string') type = 'string';
  else if (def.type === 'integer') type = 'number';
  else if (def.type === 'number') type = 'number';
  else if (def.type === 'boolean') type = 'boolean';
  else if (def.type === 'object') type = 'Json';
  else if (def.format === 'uuid') type = 'string';
  else if (def.format === 'date-time') type = 'string';
  
  if (nullable) return type + ' | null';
  return type + (def.nullable ? ' | null' : '');
}

main().catch(console.error);

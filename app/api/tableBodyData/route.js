// app/api/tableBodyData/route.js
// import db from '@/app/lib/db';

// export async function GET(req) {
//   try {
//     const [rows] = await db.query('SELECT * FROM tablebody ORDER BY id'); // Adjust the query as needed
//     return new Response(JSON.stringify(rows), {
//       status: 200,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   } catch (error) {
//     console.log(error);
//     return new Response(JSON.stringify({ error: 'Failed to fetch data' }), {
//       status: 500,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   }
// }


import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js'

export async function GET(req, res) {
  if (req.method === 'GET') {
    // Create a single supabase client for interacting with your database
    const supabase = createClient('https://rwmevdeoxkfkblouqrmu.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3bWV2ZGVveGtma2Jsb3Vxcm11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTk1MjYsImV4cCI6MjA2NTIzNTUyNn0.P4H_rGGEXvAWDxgxVAMbjxMxU26NVB0SjL3yVsQuFuA');
    const { data, error } = await supabase
      .from('tableBody')
      .select();
    const sortedData = data.sort((a, b) => a.id - b.id);
    
    return new Response(JSON.stringify(sortedData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } else {
    res.setHeader('Allow', ['GET']);
    return NextResponse.json({'status': false, message: `Method ${req.method} Not Allowed`});
  }
}
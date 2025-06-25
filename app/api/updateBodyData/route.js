// app/api/tableBodyData/route.js
// import db from '@/app/lib/db';

// export async function GET(req, res) {
//   if (req.method === 'GET') {
//     const { searchParams } = new URL(req.url);
//     const id = searchParams.get('id');
//     const field = searchParams.get('field');
//     const data = searchParams.get('data');
//     console.log(`UPDATE tablebody SET ${field} = '${data}' WHERE id=${id}`);

//     const result = await db.query(`UPDATE tablebody SET ${field} = '${data}' WHERE id=${id}`);

//     // Respond with the received parameters
//     return NextResponse.json({'status': true, result});
//   } else {
//     // Handle any other HTTP method
//     res.setHeader('Allow', ['GET']);
//     res.status(405).end(`Method ${req.method} Not Allowed`);
//   }
// }


import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'

export async function GET(req, res) {
  if (req.method === 'GET') {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const field = searchParams.get('field');
    const data = searchParams.get('data');
    const newData = { id: id, field: field, data: data };

    const supabase = createClient('https://rwmevdeoxkfkblouqrmu.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3bWV2ZGVveGtma2Jsb3Vxcm11Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTY1OTUyNiwiZXhwIjoyMDY1MjM1NTI2fQ.hTdt6STn8fmul88iGjwFbp7zq1HP8vvct-r0fHZsRUs');

    try {
      const { error } = await supabase.from('tableBody')
        .update({ [newData.field]: newData.data })
        // .update({ "commission": 2 })
        .eq('id', newData.id);
      return NextResponse.json({
        status: true,
        message: `Data updated successfully: ${error}`,
      });
    } catch (err) {
      return NextResponse.json({ status: false, message: `Error writing file: ${err}` });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return NextResponse.json({ status: false, message: `Method ${req.method} Not Allowed` });
  }
}
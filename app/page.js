'use client'
import Image from "next/image";
import { useEffect, useState } from "react";
import EditableTable from "@/app/components/EditableTable";

export default function Home() {
  const [data, setData] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/api/tableBodyData');
      const data = await response.json();
      setData(data);
    }
    fetchData();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="w-full">
        <h1 className="text-2xl font-bold mb-6">Edit Table Body Data</h1>
        <p className="mb-4 text-gray-600">
          Double-click any cell to edit. Press Enter or click outside to save changes.
        </p>
        <EditableTable data={data} />
      </div>
    </main>
  );
}

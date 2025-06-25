"use client"

import { useState, useRef, useEffect } from "react"
import UndoRedoManager from "../UndoRedoManager"

export default function EditableTable(props) {
    // Sample data - replace with your actual data
    const [data, setData] = useState([])

    // State to track which cell is being edited
    const [editCell, setEditCell] = useState({
        rowId: null,
        field: null,
        data: null,
    })

    // Add pagination state after the editCell state
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [currentItem, setCurrentItem] = useState({});

    const [undoRedoMgr] = useState(new UndoRedoManager());

    // Ref for the input element
    const inputRef = useRef(null)

    useEffect(() => {
        setData(props.data);
    }, [props.data])

    // Focus the input when editing starts
    useEffect(() => {
        if (editCell.rowId !== null && editCell.field !== null) {
            inputRef.current?.focus()
        }
    }, [editCell])

    // Handle double click on a cell
    const handleDoubleClick = (rowId, field, data) => {
        setEditCell({ rowId, field, data })
    }

    // Handle input change
    const handleChange = (e) => {
        if (editCell.rowId === null || editCell.field === null) return

        const newData = data.map((row, index) => {
            if (row.id === editCell.rowId) {
                return { ...row, [editCell.field]: e.target.value }
            }
            return row
        })
        
        setData(newData)
        // update table data
        setCurrentItem({ id: editCell.rowId, field: editCell.field, data: { old: editCell.data, new: e.target.value.toString() } });

    }

    // update data
    const updateData = async () => {
        console.log(currentItem);
        if (currentItem.id != null && currentItem.field != null && currentItem.data != null && currentItem.data.new != null && currentItem.data.old != null) {
            let value = currentItem.data.new;
            if (value.includes('%')) {
                value = value.replace("%", "%%");
            }
            const response = await fetch(`/api/updateBodyData?id=${currentItem.id}&field=${currentItem.field}&data=${value}`);
            const data = await response.json();
            console.log(data);
        }
    }

    // Handle saving the edit (on blur or Enter key)
    const handleSave = () => {
        setEditCell({ rowId: null, field: null, data: null })

        updateData();

        // push item into stack
        undoRedoMgr.performAction(currentItem);
    }

    // Handle key press (for Enter key)
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSave()
        }
    }

    // Get the value of a cell
    const getCellValue = (row, field) => {
        return row[field]
    }

    // Render a cell (either as text or input)
    const renderCell = (row, field, index) => {
        const isEditing = editCell.rowId === row.id && editCell.field === field

        if (isEditing) {
            return (
                <input
                    ref={inputRef}
                    type="text"
                    value={getCellValue(row, field)}
                    onChange={handleChange}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    className="w-full px-2 py-1 border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                    autoFocus
                />
            )
        }

        return (
            <div className="px-4 py-2 w-full h-full cursor-pointer" onDoubleClick={() => handleDoubleClick(row.id, field, getCellValue(row, field))}>
                {getCellValue(row, field)}
            </div>
        )
    }

    // Add this function after the renderCell function
    const paginate = (data) => {
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return data.slice(startIndex, endIndex)
    }

    // Add this function after the paginate function
    const totalPages = Math.ceil(data.length / itemsPerPage)

    // Add this function after the totalPages calculation
    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return
        setCurrentPage(page)
    }

    const handleUndo = () => {
        const state = undoRedoMgr.getCurrentState();
        if (state === null || state.id === null || state.field === null) return

        const newData = data.map((row, index) => {
            if (row.id === state.id) {
                return { ...row, [state.field]: state.data.old }
            }
            return row
        })

        setData(newData)

        undoRedoMgr.undo();
        updateData();
    }

    const handleRedo = () => {
        const state = undoRedoMgr.getCurrentState();
        if (state === null || state.id === null || state.field === null) return

        const newData = data.map((row, index) => {
            if (row.id === state.id) {
                return { ...row, [state.field]: state.data.new }
            }
            return row
        })

        setData(newData)
        undoRedoMgr.redo();
        updateData();
    }

    const handleDownloadData = () => {
        const blob = new Blob([JSON.stringify(data)], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        // Create a link element
        const link = document.createElement('a');
        link.href = url;
        link.download = 'tableDataBody.json'; // Specify the file name

        // Append to the body
        document.body.appendChild(link);
        link.click(); // Trigger the download

        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(url); // Free up memory
    }

    // Modify the return statement to include pagination
    // Replace the entire return statement with this updated version:
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center space-x-2">
                <button
                    onClick={() => handleUndo()}
                    className={`px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300`}
                >
                    Undo
                </button>
                <button
                    onClick={() => handleRedo()}
                    className={`px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300`}
                >
                    Redo
                </button>
                <button
                    onClick={() => handleDownloadData()}
                    className={`px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300`}
                >
                    Download
                </button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-4 py-3">Frim</th>
                            <th className="px-4 py-3">Discount</th>
                            <th className="px-4 py-3">Original Price</th>
                            <th className="px-4 py-3">New Price</th>
                            <th className="px-4 py-3">Code</th>
                            <th className="px-4 py-3">Size</th>
                            <th className="px-4 py-3">Steps</th>
                            <th className="px-4 py-3">Profit Split</th>
                            <th className="px-4 py-3">Profit Target</th>
                            <th className="px-4 py-3">Max Drawdown</th>
                            <th className="px-4 py-3">Daily Drawdown</th>
                            <th className="px-4 py-3">Commission</th>
                            <th className="px-4 py-3">Leverage</th>
                            <th className="px-4 py-3">Trust Pilot Rating</th>
                            <th className="px-4 py-3">Cashback</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* {paginate(data).map((row) => ( */}
                        {data.map((row, index) => (
                            <tr key={row.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="p-0">{renderCell(row, "firm", index)}</td>
                                <td className="p-0">{renderCell(row, "calcPrice", index)}</td>
                                <td className="p-0">{renderCell(row, "salePrice", index)}</td>
                                <td className="p-0">{renderCell(row, "price", index)}</td>
                                <td className="p-0">{renderCell(row, "discount", index)}</td>
                                <td className="p-0">{renderCell(row, "size", index)}</td>
                                <td className="p-0">{renderCell(row, "steps", index)}</td>
                                <td className="p-0">{renderCell(row, "profitSplit", index)}</td>
                                <td className="p-0">{renderCell(row, "profitTarget", index)}</td>
                                <td className="p-0">{renderCell(row, "maxDrawDown", index)}</td>
                                <td className="p-0">{renderCell(row, "dailyDrawDown", index)}</td>
                                <td className="p-0">{renderCell(row, "commission", index)}</td>
                                <td className="p-0">{renderCell(row, "leverage", index)}</td>
                                <td className="p-0">{renderCell(row, "rating", index)}</td>
                                <td className="p-0">{renderCell(row, "credits", index)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                    {/* Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, data.length)} of{" "}
                    {data.length} entries */}
                    Total {data.length} entries
                </div>
                {/* <div className="flex items-center space-x-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded-md ${currentPage === 1
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                    >
                        Previous
                    </button>

                    <div className="flex items-center">
                        <span className="mr-2 text-sm text-gray-600">Page</span>
                        <input
                            type="number"
                            min="1"
                            max={totalPages}
                            value={currentPage}
                            onChange={(e) => {
                                const page = Number.parseInt(e.target.value)
                                if (!isNaN(page) && page >= 1 && page <= totalPages) {
                                    setCurrentPage(page)
                                }
                            }}
                            onBlur={(e) => {
                                const page = Number.parseInt(e.target.value)
                                if (isNaN(page) || page < 1) {
                                    setCurrentPage(1)
                                } else if (page > totalPages) {
                                    setCurrentPage(totalPages)
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.target.blur()
                                }
                            }}
                            className="w-12 px-2 py-1 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-600">of {totalPages}</span>
                    </div>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 rounded-md ${currentPage === totalPages
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                    >
                        Next
                    </button>
                </div> */}
            </div>
        </div>
    )
}


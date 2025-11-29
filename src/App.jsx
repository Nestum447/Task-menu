import { useState, useEffect } from "react";

export default function App() {
  const columns = ["todo", "proceso", "delegadas"];

  const loadTasks = () => {
    const saved = localStorage.getItem("tasks-board");
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  };

  const [tasks, setTasks] = useState(
    loadTasks() || {
      todo: [
        { id: "1", text: "Tarea 1", completed: false },
        { id: "2", text: "Tarea 2", completed: false },
      ],
      proceso: [{ id: "3", text: "Tarea 3 en proceso", completed: false }],
      delegadas: [{ id: "4", text: "Tarea delegada", completed: false }],
    }
  );

  const [newTask, setNewTask] = useState("");
  const [activeTab, setActiveTab] = useState("todo");
  const [draggingTask, setDraggingTask] = useState(null);

  useEffect(() => {
    localStorage.setItem("tasks-board", JSON.stringify(tasks));
  }, [tasks]);

  const deleteTask = (id) => {
    setTasks((prev) => {
      const newState = { ...prev };
      for (const col in newState) {
        newState[col] = newState[col].filter((t) => t.id !== id);
      }
      return newState;
    });
  };

  const toggleComplete = (id) => {
    setTasks((prev) => {
      const newState = { ...prev };
      for (const col in newState) {
        newState[col] = newState[col].map((t) =>
          t.id === id ? { ...t, completed: !t.completed } : t
        );
      }
      return newState;
    });
  };

  // -----------------------------
  // Mover tarea individual
  // -----------------------------
  const moveTaskToColumn = (task, fromCol, toCol) => {
    if (fromCol === toCol) return;
    setTasks((prev) => {
      const newState = { ...prev };
      newState[fromCol] = newState[fromCol].filter((t) => t.id !== task.id);
      newState[toCol] = [...newState[toCol], task];
      return newState;
    });
    setActiveTab(toCol);
  };

  // -----------------------------
  // Reordenar dentro de la columna
  // -----------------------------
  const onDragStart = (task, col) => setDraggingTask({ task, col });
  const onDrop = (col, index) => {
    if (!draggingTask) return;
    const { task, col: fromCol } = draggingTask;

    setTasks((prev) => {
      const newState = { ...prev };
      // Quitar de origen
      newState[fromCol] = newState[fromCol].filter((t) => t.id !== task.id);
      // Insertar en nuevo índice
      newState[col] = [
        ...newState[col].slice(0, index),
        task,
        ...newState[col].slice(index),
      ];
      return newState;
    });

    setDraggingTask(null);
  };

  const renderColumn = (key) => (
    <div className="bg-white p-4 rounded shadow min-h-[300px] w-full max-w-md">
      <h2 className="text-xl font-semibold mb-3 capitalize">{key}</h2>

      {tasks[key].map((task, idx) => (
        <div
          key={task.id}
          draggable
          onDragStart={() => onDragStart(task, key)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => onDrop(key, idx)}
          className={`flex items-center justify-between p-3 mb-2 rounded shadow cursor-grab ${
            task.completed ? "bg-gray-200 line-through" : "bg-gray-100"
          }`}
        >
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleComplete(task.id)}
            />
            <span>{task.text}</span>
          </div>

          <div className="flex items-center gap-1">
            <select
              onChange={(e) => moveTaskToColumn(task, key, e.target.value)}
              className="border rounded p-1 text-sm"
              defaultValue=""
            >
              <option value="">Mover</option>
              {columns
                .filter((col) => col !== key)
                .map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
            </select>

            <button
              onClick={() => deleteTask(task.id)}
              className="w-7 h-7 flex items-center justify-center bg-red-600 text-white rounded-full text-lg ml-1"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-center mb-6">Gestor de Tareas</h1>

      {/* Nueva tarea */}
      <div className="flex justify-center mb-6 gap-2">
        <input
          type="text"
          className="border border-gray-400 rounded p-2 w-64"
          placeholder="Nueva tarea..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button
          onClick={() => {
            if (!newTask.trim()) return;
            const item = {
              id: Date.now().toString(),
              text: newTask,
              completed: false,
            };
            setTasks((p) => ({ ...p, todo: [...p.todo, item] }));
            setNewTask("");
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Agregar
        </button>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-2 mb-5">
        {columns.map((col) => (
          <button
            key={col}
            className={`px-4 py-2 rounded ${
              activeTab === col ? "bg-blue-600 text-white" : "bg-white shadow"
            }`}
            onClick={() => setActiveTab(col)}
          >
            {col === "todo"
              ? "To Do"
              : col === "proceso"
              ? "En Proceso"
              : "Delegadas"}
          </button>
        ))}
      </div>

      {renderColumn(activeTab)}
    </div>
  );
}

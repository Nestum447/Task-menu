import { useState, useEffect } from "react";

export default function App() {
  // -----------------------------
  //     CARGAR LOCAL STORAGE
  // -----------------------------
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
  const [dragging, setDragging] = useState(null);

  const columns = ["todo", "proceso", "delegadas"];

  // -----------------------------
  //     GUARDAR LOCAL STORAGE
  // -----------------------------
  useEffect(() => {
    localStorage.setItem("tasks-board", JSON.stringify(tasks));
  }, [tasks]);

  // -----------------------------
  //     BORRAR TAREA
  // -----------------------------
  const deleteTask = (id) => {
    setTasks((prev) => {
      const newState = { ...prev };
      for (const col in newState) {
        newState[col] = newState[col].filter((t) => t.id !== id);
      }
      return newState;
    });
  };

  // -----------------------------
  //     COMPLETAR TAREA
  // -----------------------------
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
  //     DRAG & DROP
  // -----------------------------
  const onDragStart = (task, sourceCol) => {
    setDragging({ task, sourceCol });
  };

  const onDrop = (destCol) => {
    if (!dragging) return;
    setTasks((prev) => {
      const newState = { ...prev };
      // quitar de origen
      newState[dragging.sourceCol] = newState[dragging.sourceCol].filter(
        (t) => t.id !== dragging.task.id
      );
      // agregar a destino
      newState[destCol] = [...newState[destCol], dragging.task];
      return newState;
    });
    setDragging(null);
    setActiveTab(destCol); // Cambia la pestaña automáticamente al destino
  };

  // -----------------------------
  //     RENDER COLUMNA
  // -----------------------------
  const renderColumn = (key) => (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => onDrop(key)}
      className="bg-white p-4 rounded shadow min-h-[300px] w-full max-w-md"
    >
      {tasks[key].map((task) => (
        <div
          key={task.id}
          draggable
          onDragStart={() => onDragStart(task, key)}
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

          <button
            onClick={() => deleteTask(task.id)}
            className="w-7 h-7 flex items-center justify-center bg-red-600 text-white rounded-full text-lg ml-2"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-center mb-6">Gestor de Tareas</h1>

      {/* INPUT NUEVA TAREA */}
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

      {/* TABS COLUMNAS */}
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

      {/* COLUMNA ACTIVA */}
      {renderColumn(activeTab)}
    </div>
  );
}

import { useState, useEffect, useRef } from "react";

export default function App() {
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

  const columns = ["todo", "proceso", "delegadas"];

  const moveTask = (task, fromCol, direction) => {
    const currentIndex = columns.indexOf(fromCol);
    let targetIndex = currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= columns.length) return;

    const targetCol = columns[targetIndex];
    setTasks((prev) => {
      const newState = { ...prev };
      newState[fromCol] = newState[fromCol].filter((t) => t.id !== task.id);
      newState[targetCol] = [...newState[targetCol], task];
      return newState;
    });
  };

  const renderTask = (task, col) => {
    const touchStartX = useRef(0);

    return (
      <div
        key={task.id}
        className={`flex items-center justify-between p-3 mb-2 rounded shadow cursor-pointer ${
          task.completed ? "bg-gray-200 line-through" : "bg-gray-100"
        }`}
        onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          const deltaX = e.changedTouches[0].clientX - touchStartX.current;
          if (deltaX > 50) moveTask(task, col, 1); // swipe derecha
          else if (deltaX < -50) moveTask(task, col, -1); // swipe izquierda
        }}
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
    );
  };

  const renderColumn = (key, title, color) => (
    <div className="bg-white p-4 rounded shadow min-h-[300px] flex-1">
      <h2 className={`text-xl font-semibold mb-3 ${color}`}>{title}</h2>
      {tasks[key].map((task) => renderTask(task, key))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Gestor de Tareas</h1>

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

      <div className="flex gap-4 flex-wrap">
        {renderColumn(activeTab, activeTab === "todo" ? "To Do" : activeTab === "proceso" ? "En Proceso" : "Delegadas", "text-blue-700")}
      </div>
    </div>
  );
}

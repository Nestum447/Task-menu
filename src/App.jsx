import { useState } from "react";

// ---------------------------
//   ÍCONO TRASH (SVG PURO)
// ---------------------------
const Trash = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

export default function App() {
  const [tasks, setTasks] = useState({
    hoy: [],
    proceso: [],
    finalizado: []
  });

  const [newTask, setNewTask] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);

  // ---------------------------
  //   AGREGAR TAREA
  // ---------------------------
  const addTask = () => {
    if (!newTask.trim()) return;

    const newItem = {
      id: Date.now().toString(),
      text: newTask,
      column: "hoy"
    };

    setTasks((prev) => ({
      ...prev,
      hoy: [...prev.hoy, newItem]
    }));

    setNewTask("");
  };

  // ---------------------------
  //   SELECCIONAR TAREA
  // ---------------------------
  const handleSelectTask = (task) => {
    setSelectedTask(task);
  };

  // ---------------------------
  //  MOVER ENTRE COLUMNAS
  // ---------------------------
  const moveTask = (taskId, fromColumn, toColumn) => {
    if (fromColumn === toColumn) return;

    const taskToMove = tasks[fromColumn].find((t) => t.id === taskId);
    if (!taskToMove) return;

    const updatedTask = { ...taskToMove, column: toColumn };

    setTasks((prev) => ({
      ...prev,
      [fromColumn]: prev[fromColumn].filter((t) => t.id !== taskId),
      [toColumn]: [...prev[toColumn], updatedTask]
    }));

    setSelectedTask(null);
  };

  // ---------------------------
  //       BORRAR TAREA
  // ---------------------------
  const deleteTask = (column, id) => {
    setTasks((prev) => ({
      ...prev,
      [column]: prev[column].filter((t) => t.id !== id)
    }));

    if (selectedTask?.id === id) setSelectedTask(null);
  };

  // ---------------------------
  //   COMPONENTE COLUMNA
  // ---------------------------
  const Column = ({ title, columnKey }) => (
    <div className="p-3 w-full bg-gray-100 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-2 text-center">{title}</h2>

      {tasks[columnKey].map((task) => (
        <div
          key={task.id}
          className={`p-2 my-2 bg-white rounded-lg shadow flex justify-between items-center border
            ${selectedTask?.id === task.id ? "border-blue-500" : "border-transparent"}`}
          onClick={() => handleSelectTask(task)}
        >
          <span>{task.text}</span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteTask(columnKey, task.id);
            }}
          >
            <Trash size={20} />
          </button>
        </div>
      ))}

      {/* MENÚ DE MOVIMIENTO */}
      {selectedTask && selectedTask.column === columnKey && (
        <div className="mt-3 bg-blue-100 p-3 rounded-lg text-center">
          <p className="font-bold mb-2">Mover a:</p>

          <div className="flex justify-around">
            <button
              className="px-3 py-1 bg-blue-500 text-white rounded-lg"
              onClick={() => moveTask(selectedTask.id, columnKey, "hoy")}
            >
              Hoy
            </button>

            <button
              className="px-3 py-1 bg-blue-500 text-white rounded-lg"
              onClick={() => moveTask(selectedTask.id, columnKey, "proceso")}
            >
              En Proceso
            </button>

            <button
              className="px-3 py-1 bg-blue-500 text-white rounded-lg"
              onClick={() => moveTask(selectedTask.id, columnKey, "finalizado")}
            >
              Finalizado
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-4 flex flex-col gap-3 max-w-xl mx-auto">

      {/* INPUT */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="flex-1 p-2 border rounded-lg"
          placeholder="Nueva tarea..."
        />
        <button
          onClick={addTask}
          className="px-4 bg-green-500 text-white rounded-lg"
        >
          Agregar
        </button>
      </div>

      {/* COLUMNAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Column title="Hoy" columnKey="hoy" />
        <Column title="En Proceso" columnKey="proceso" />
        <Column title="Finalizado" columnKey="finalizado" />
      </div>
    </div>
  );
}

import { useState } from "react";
import { Trash } from "lucide-react";

export default function App() {
  const [tasks, setTasks] = useState({
    hoy: [],
    proceso: [],
    finalizado: []
  });

  const [newTask, setNewTask] = useState("");
  const [selectedTask, setSelectedTask] = useState(null); // ← tarea seleccionada

  // ---------------------------
  //   AGREGAR TAREA
  // ---------------------------
  const addTask = () => {
    if (!newTask.trim()) return;

    const newItem = {
      id: Date.now().toString(),
      text: newTask,
      done: false,
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
  //  MOVER TAREA ENTRE COLUMNAS
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

    setSelectedTask(null); // cerrar menú
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
  //  RENDERIZAR UNA COLUMNA
  // ---------------------------
  const Column = ({ title, columnKey }) => {
    return (
      <div className="p-3 w-full bg-gray-100 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-2 text-center">{title}</h2>

        {tasks[columnKey].map((task) => (
          <div
            key={task.id}
            className={`p-2 my-2 bg-white rounded-lg shadow flex justify-between items-center border
              ${selectedTask?.id === task.id ? "border-blue-500" : "border-transparent"}`}
            onClick={() => handleSelectTask(task)}
          >
            <span className="flex-1">{task.text}</span>

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

        {/* MENÚ PARA MOVER TAREA */}
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
  };

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

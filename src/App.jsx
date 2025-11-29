import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

export default function App() {
  // ---------------------------
  //   LOCAL STORAGE: CARGAR
  // ---------------------------
  const loadTasks = () => {
    const saved = localStorage.getItem("tasks-board");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
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

  // pestaña activa
  const [activeTab, setActiveTab] = useState("todo");

  // ---------------------------
  //   LOCAL STORAGE: GUARDAR
  // ---------------------------
  useEffect(() => {
    localStorage.setItem("tasks-board", JSON.stringify(tasks));
  }, [tasks]);

  // ---------------------------
  //   BORRAR TAREA (CANASTA)
  // ---------------------------
  const deleteTask = (id) => {
    setTasks((prev) => {
      const newState = { ...prev };
      for (const col in newState) {
        newState[col] = newState[col].filter((t) => t.id !== id);
      }
      return newState;
    });
  };

  // ---------------------------
  //   MARCAR COMPLETADA
  // ---------------------------
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

  // ---------------------------
  //   DRAG & DROP
  // ---------------------------
  const handleDragEnd = (result) => {
    const sourceColumn = result.source.droppableId;
    if (!result.destination) {
      setTasks((prev) => ({
        ...prev,
        [sourceColumn]: prev[sourceColumn].filter(
          (_, index) => index !== result.source.index
        ),
      }));
      return;
    }

    const destColumn = result.destination.droppableId;

    if (sourceColumn === destColumn) {
      const columnTasks = Array.from(tasks[sourceColumn]);
      const [moved] = columnTasks.splice(result.source.index, 1);
      columnTasks.splice(result.destination.index, 0, moved);

      setTasks({
        ...tasks,
        [sourceColumn]: columnTasks,
      });
      return;
    }

    const sourceTasks = Array.from(tasks[sourceColumn]);
    const destTasks = Array.from(tasks[destColumn]);
    const [moved] = sourceTasks.splice(result.source.index, 1);
    destTasks.splice(result.destination.index, 0, moved);

    setTasks({
      ...tasks,
      [sourceColumn]: sourceTasks,
      [destColumn]: destTasks,
    });
  };

  // ---------------------------
  //   AGREGAR TAREA
  // ---------------------------
  const addTask = () => {
    if (!newTask.trim()) return;

    const newId = Date.now().toString();
    const newItem = { id: newId, text: newTask, completed: false };

    setTasks({
      ...tasks,
      todo: [...tasks.todo, newItem],
    });

    setNewTask("");
  };

  // ---------------------------
  //   RENDERIZAR COLUMNA
  // ---------------------------
  const renderColumn = (key, title, color, bgColor) => (
    <Droppable droppableId={key}>
      {(provided) => (
        <div
          className="bg-white p-4 rounded shadow min-h-[300px]"
          ref={provided.innerRef}
          {...provided.droppableProps}
        >
          <h2 className={`text-xl font-semibold mb-3 ${color}`}>{title}</h2>

          {tasks[key].map((task, index) => (
            <Draggable key={task.id} draggableId={task.id} index={index}>
              {(provided) => (
                <div
                  className={`flex items-center justify-between p-3 rounded mb-2 shadow cursor-grab active:cursor-grabbing ${bgColor}`}
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleComplete(task.id)}
                    className="mr-2"
                    onClick={(e) => e.stopPropagation()}
                  />

                  <span
                    className={
                      task.completed ? "line-through text-gray-600" : ""
                    }
                  >
                    {task.text}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTask(task.id);
                    }}
                    className="text-red-600 text-xl ml-2"
                  >
                    🗑️
                  </button>
                </div>
              )}
            </Draggable>
          ))}

          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );

  // ---------------------------
  //   UI
  // ---------------------------
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Gestor de Tareas</h1>

      {/* Input para nueva tarea */}
      <div className="flex justify-center mb-6 gap-2">
        <input
          type="text"
          className="border border-gray-400 rounded p-2 w-64"
          placeholder="Nueva tarea..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button
          onClick={addTask}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Agregar
        </button>
      </div>

      {/* Pestañas */}
      <div className="flex justify-center gap-2 mb-5">
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "todo"
              ? "bg-blue-600 text-white"
              : "bg-white shadow"
          }`}
          onClick={() => setActiveTab("todo")}
        >
          To Do
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "proceso"
              ? "bg-yellow-600 text-white"
              : "bg-white shadow"
          }`}
          onClick={() => setActiveTab("proceso")}
        >
          En Proceso
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "delegadas"
              ? "bg-green-700 text-white"
              : "bg-white shadow"
          }`}
          onClick={() => setActiveTab("delegadas")}
        >
          Delegadas
        </button>
      </div>

      {/* LISTA SEGÚN PESTAÑA */}
      <DragDropContext onDragEnd={handleDragEnd}>
        {activeTab === "todo" &&
          renderColumn("todo", "To Do", "text-blue-700", "bg-blue-100")}
        {activeTab === "proceso" &&
          renderColumn("proceso", "En Proceso", "text-yellow-600", "bg-yellow-100")}
        {activeTab === "delegadas" &&
          renderColumn("delegadas", "Delegadas", "text-green-700", "bg-green-100")}
      </DragDropContext>
    </div>
  );
}

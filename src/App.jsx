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
  const [activeTab, setActiveTab] = useState("todo");
  const [isDragging, setIsDragging] = useState(false);

  // ---------------------------
  //   LOCAL STORAGE: GUARDAR
  // ---------------------------
  useEffect(() => {
    localStorage.setItem("tasks-board", JSON.stringify(tasks));
  }, [tasks]);

  // ---------------------------
  //   BORRAR TAREA
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
  //   COMPLETAR TAREA
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
  //   AUTO CAMBIO DE PESTAÑA
  //   (ahora usando zonas droppables laterales)
  // ---------------------------
  const handleDragStart = () => setIsDragging(true);
  const handleDragStop = () => setIsDragging(false);

  const handleDragUpdate = (update) => {
    // Preferimos usar destination droppableId si existe (lo más fiable)
    const dest = update?.destination?.droppableId;
    if (dest === "side-left") {
      // cambiar a pestaña izquierda
      if (activeTab === "delegadas") setActiveTab("proceso");
      else if (activeTab === "proceso") setActiveTab("todo");
      return;
    } else if (dest === "side-right") {
      // cambiar a pestaña derecha
      if (activeTab === "todo") setActiveTab("proceso");
      else if (activeTab === "proceso") setActiveTab("delegadas");
      return;
    }

    // Fallback: si no hay destination, usamos clientSelection (por compatibilidad)
    if (!update.clientSelection) return;
    const x = update.clientSelection.x;
    const width = window.innerWidth;

    const safeLeft = width * 0.25;
    const safeRight = width * 0.75;

    if (x < safeLeft) {
      if (activeTab === "delegadas") setActiveTab("proceso");
      else if (activeTab === "proceso") setActiveTab("todo");
      return;
    }

    if (x > safeRight) {
      if (activeTab === "todo") setActiveTab("proceso");
      else if (activeTab === "proceso") setActiveTab("delegadas");
      return;
    }
  };

  // ---------------------------
  //   DRAG & DROP FINAL
  // ---------------------------
  const handleDragEnd = (result) => {
    handleDragStop(); // asegurar que hide zones
    const { source, destination } = result;

    if (!destination) return;

    const startCol = source.droppableId;
    // Si el destino es una zona lateral, interpretamos destino como la pestaña activa actual
    const destId =
      destination.droppableId === "side-left" ||
      destination.droppableId === "side-right"
        ? activeTab
        : destination.droppableId;

    const endCol = destId;

    // MISMA COLUMNA → reordenar
    if (startCol === endCol) {
      const newList = Array.from(tasks[startCol]);
      const [moved] = newList.splice(source.index, 1);
      newList.splice(destination.index, 0, moved);

      setTasks((prev) => ({
        ...prev,
        [startCol]: newList,
      }));
      return;
    }

    // ENTRE COLUMNAS
    const startList = Array.from(tasks[startCol]);
    const endList = Array.from(tasks[endCol]);

    const [moved] = startList.splice(source.index, 1);
    endList.splice(destination.index, 0, moved);

    setTasks((prev) => ({
      ...prev,
      [startCol]: startList,
      [endCol]: endList,
    }));
  };

  // ---------------------------
  //   AGREGAR TAREA
  // ---------------------------
  const addTask = () => {
    if (!newTask.trim()) return;

    const newId = Date.now().toString();
    const item = { id: newId, text: newTask, completed: false };

    setTasks((prev) => ({
      ...prev,
      todo: [...prev.todo, item],
    }));

    setNewTask("");
  };

  // ---------------------------
  //   RENDER COLUMNA
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
              {(provided, snapshot) => (
                <div
                  className={`flex items-center justify-between p-3 rounded mb-2 shadow cursor-grab active:cursor-grabbing ${bgColor} ${
                    snapshot.isDragging ? "opacity-95" : ""
                  }`}
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
    <div className="min-h-screen bg-gray-100 p-6 relative">
      <h1 className="text-3xl font-bold text-center mb-6">Gestor de Tareas</h1>

      {/* Input nueva tarea */}
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

      {/* Tabs */}
      <div className="flex justify-center gap-2 mb-5 relative z-10">
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "todo" ? "bg-blue-600 text-white" : "bg-white shadow"
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

      <DragDropContext
        onDragStart={handleDragStart}
        onDragUpdate={handleDragUpdate}
        onDragEnd={handleDragEnd}
        onBeforeDragEnd={handleDragStop}
      >
        {/* Overlay DROPPABLE ZONES (siempre montadas, ocupan 25% a cada lado) */}
        { /* visibles solo cuando isDragging para no interferir con clicks */ }
        {isDragging && (
          <>
            <Droppable droppableId="side-left">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`absolute left-0 top-0 h-full w-1/4 z-20 pointer-events-auto transition-all ${
                    snapshot.isDraggingOver ? "bg-blue-200/40" : "bg-transparent"
                  }`}
                >
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            <Droppable droppableId="side-right">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`absolute right-0 top-0 h-full w-1/4 z-20 pointer-events-auto transition-all ${
                    snapshot.isDraggingOver ? "bg-blue-200/40" : "bg-transparent"
                  }`}
                >
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </>
        )}

        {/* Solo se monta la columna activa */}
        <div className="relative z-0">
          {activeTab === "todo" &&
            renderColumn("todo", "To Do", "text-blue-700", "bg-blue-100")}

          {activeTab === "proceso" &&
            renderColumn(
              "proceso",
              "En Proceso",
              "text-yellow-600",
              "bg-yellow-100"
            )}

          {activeTab === "delegadas" &&
            renderColumn(
              "delegadas",
              "Delegadas",
              "text-green-700",
              "bg-green-100"
            )}
        </div>
      </DragDropContext>
    </div>
  );
}

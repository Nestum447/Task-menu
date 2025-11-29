import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

export default function App() {
  // -----------------------------
  //     LOCAL STORAGE CARGAR
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
  const [draggingItem, setDraggingItem] = useState(null);

  // Sensores DND-KIT (TOUCH + POINTER → funciona en celular)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor)
  );

  // -----------------------------
  //     LOCAL STORAGE GUARDAR
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
  //     AUTOCAMBIO DE PESTAÑA
  // -----------------------------
  const handleAutoTab = (x) => {
    const width = window.innerWidth;

    // zona izquierda 0–25%
    if (x < width * 0.25) {
      if (activeTab === "delegadas") setActiveTab("proceso");
      else if (activeTab === "proceso") setActiveTab("todo");
    }

    // zona derecha 75–100%
    if (x > width * 0.75) {
      if (activeTab === "todo") setActiveTab("proceso");
      else if (activeTab === "proceso") setActiveTab("delegadas");
    }
  };

  // -----------------------------
  //     DND-KIT: INICIO
  // -----------------------------
  const onDragStart = (e) => {
    const id = e.active.id;

    const all = [...tasks.todo, ...tasks.proceso, ...tasks.delegadas];
    setDraggingItem(all.find((t) => t.id === id));
  };

  // -----------------------------
  //     DND-KIT: MOVIMIENTO
  // -----------------------------
  const onDragMove = (e) => {
    if (!e.delta) return;

    const clientX = e.active.rect.current.translated?.left;
    if (clientX) handleAutoTab(clientX);
  };

  // -----------------------------
  //     DND-KIT: SOLTAR (END)
  // -----------------------------
  const onDragEnd = (e) => {
    const { active, over } = e;
    if (!over) return;

    const sourceCol = active.data.current.sortable.containerId;
    const destCol = activeTab; // la columna visible es el destino real

    const sourceIndex = active.data.current.sortable.index;
    const destIndex = over.data.current?.sortable?.index ?? 0;

    // misma columna → solo reordenar
    if (sourceCol === destCol) {
      setTasks((prev) => ({
        ...prev,
        [sourceCol]: arrayMove(prev[sourceCol], sourceIndex, destIndex),
      }));
    } else {
      // entre columnas
      const item = tasks[sourceCol][sourceIndex];

      setTasks((prev) => {
        const sourceList = [...prev[sourceCol]];
        const destList = [...prev[destCol]];

        sourceList.splice(sourceIndex, 1);
        destList.splice(destIndex, 0, item);

        return {
          ...prev,
          [sourceCol]: sourceList,
          [destCol]: destList,
        };
      });
    }

    setDraggingItem(null);
  };

  // -----------------------------
  //     SORTABLE ITEM
  // -----------------------------
  function SortableItem({ task, id, index, bgColor }) {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`flex items-center justify-between p-3 rounded mb-2 shadow cursor-grab active:cursor-grabbing ${bgColor}`}
      >
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => toggleComplete(task.id)}
          className="mr-2"
        />

        <span className={task.completed ? "line-through text-gray-600" : ""}>
          {task.text}
        </span>

        <button
          onClick={() => deleteTask(task.id)}
          className="text-red-600 text-xl ml-2"
        >
          🗑️
        </button>
      </div>
    );
  }

  // -----------------------------
  //     RENDER COLUMNA
  // -----------------------------
  const renderColumn = (key, title, color, bgColor) => (
    <div className="bg-white p-4 rounded shadow min-h-[300px]">
      <h2 className={`text-xl font-semibold mb-3 ${color}`}>{title}</h2>

      <SortableContext
        items={tasks[key].map((t) => t.id)}
        strategy={verticalListSortingStrategy}
        id={key}
      >
        {tasks[key].map((task, index) => (
          <SortableItem
            key={task.id}
            id={task.id}
            task={task}
            index={index}
            bgColor={bgColor}
          />
        ))}
      </SortableContext>
    </div>
  );

  // -----------------------------
  //              UI
  // -----------------------------
  return (
    <div className="min-h-screen bg-gray-100 p-6">
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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
      >
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

        <DragOverlay>
          {draggingItem ? (
            <div className="p-3 rounded shadow bg-gray-200">
              {draggingItem.text}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const initialData = {
  todo: [
    { id: "t1", text: "Tarea 1" },
    { id: "t2", text: "Tarea 2" },
  ],
  doing: [{ id: "t3", text: "Tarea 3" }],
  done: [{ id: "t4", text: "Tarea 4" }],
};

export default function App() {
  const [tasks, setTasks] = useState(initialData);
  const [activeTab, setActiveTab] = useState("todo");
  const tabs = [
    { id: "todo", label: "Por hacer" },
    { id: "doing", label: "En proceso" },
    { id: "done", label: "Hecho" },
  ];

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceCol = source.droppableId;
    const destCol = destination.droppableId;

    const sourceTasks = [...tasks[sourceCol]];
    const destTasks = [...tasks[destCol]];

    const [removed] = sourceTasks.splice(source.index, 1);
    destTasks.splice(destination.index, 0, removed);

    setTasks({
      ...tasks,
      [sourceCol]: sourceTasks,
      [destCol]: destTasks,
    });
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">

      {/* ZONAS GRANDES PARA CAMBIAR ENTRE PESTAÑAS */}
      <div className="flex gap-2 mb-4">
        {tabs.map((t) => (
          <Droppable key={t.id} droppableId={`tab-${t.id}`}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`
                  flex-1 p-4 rounded-xl cursor-pointer
                  text-center font-semibold
                  border-2 transition-all
                  ${activeTab === t.id ? "bg-blue-500 text-white" : "bg-gray-200"}
                  ${snapshot.isDraggingOver ? "border-blue-700 scale-105" : "border-transparent"}
                `}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>

      <DragDropContext
        onDragEnd={onDragEnd}
        onDragUpdate={(update) => {
          if (!update.destination) return;

          const zone = update.destination.droppableId;
          if (zone.startsWith("tab-")) {
            const tabId = zone.replace("tab-", "");
            setActiveTab(tabId);
          }
        }}
      >

        {/* LISTA DE TAREAS DE LA PESTAÑA ACTIVA */}
        <Droppable droppableId={activeTab}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="p-4 min-h-[300px] rounded-xl bg-gray-100 border"
            >
              {tasks[activeTab].map((task, i) => (
                <Draggable key={task.id} draggableId={task.id} index={i}>
                  {(provided, snapshot) => (
                    <div
                      className={`p-3 mb-3 rounded-lg shadow bg-white transition 
                      ${snapshot.isDragging ? "scale-105 shadow-xl" : ""}`}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      {task.text}
                    </div>
                  )}
                </Draggable>
              ))}

              {provided.placeholder}
            </div>
          )}
        </Droppable>

      </DragDropContext>
    </div>
  );
}

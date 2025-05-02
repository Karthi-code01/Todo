import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Api from "../Api";
import { Modal, Button, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Todo.css";

const Todo = () => {
  const userId = localStorage.getItem("userid");
  const [todos, setTodos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editText, setEditText] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("none");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await Api.get(`/todo/getbyuser/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTodos(response?.data);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  const handleSubmit = async () => {
    if (!editText.trim()) return alert("Task cannot be empty.");

    if (editingTask) {
      try {
        const res = await Api.put(
          `/todo/update/${editingTask._id}`,
          { task: editText },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        setTodos(todos.map(t => (t._id === editingTask._id ? res.data : t)));
      } catch (e) {
        console.error("Edit failed", e);
      }
    } else {
      try {
        const response = await Api.post(
          "/todo/create",
          { task: editText, completed: false, user: userId },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        setTodos([...todos, response.data]);
      } catch (error) {
        console.error("Error adding todo:", error);
      }
    }

    setEditText("");
    setEditingTask(null);
    setShowModal(false);
  };

  const handleDelete = async (_id) => {
    try {
      await Api.delete(`/todo/delete/${_id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTodos(todos.filter(todo => todo._id !== _id));
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const handleToggleComplete = async (id, completed) => {
    try {
      await Api.put(
        `/todo/update/${id}`,
        { completed: !completed },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setTodos(
        todos.map(todo =>
          todo._id === id ? { ...todo, completed: !completed } : todo
        )
      );
    } catch (error) {
      console.error("Error toggling completion:", error);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const items = Array.from(todos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setTodos(items);

    try {
      const reorderedIds = items.map((item) => item._id);
      await Api.put(
        "/todo/reorder",
        { reorderedIds },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
    } catch (error) {
      console.error("Failed to reorder todos:", error);
    }
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleString();

  const filteredTodos = todos.filter(todo => {
    if (filter === "completed") return todo.completed;
    if (filter === "pending") return !todo.completed;
    return true;
  });

  const sortedTodos =
    sortOrder === "none"
      ? filteredTodos
      : [...filteredTodos].sort((a, b) => {
          const aDate = new Date(a.createdAt);
          const bDate = new Date(b.createdAt);
          return sortOrder === "newest" ? bDate - aDate : aDate - bDate;
        });

  const paginatedTodos = sortedTodos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(sortedTodos.length / itemsPerPage);

  return (
    <div className="todo-container">
      <div className="todo-card">
        <h2 className="todo-title">
          <span className="todo-icon">📅</span> To-Do List
        </h2>

        <div className="mb-3 d-flex gap-2 flex-wrap">
          <Button onClick={() => { setShowModal(true); setEditingTask(null); setEditText(""); }}>
            + Add Task
          </Button>

          <Form.Select
            onChange={(e) => setFilter(e.target.value)}
            style={{ width: "auto" }}
            value={filter}
          >
            <option value="all">All Tasks</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </Form.Select>

          <Form.Select
            onChange={(e) => {
              const selected = e.target.value;
              if (selected !== "none") {
                alert("Drag-and-drop works only when sorting is set to 'None'.");
              }
              setSortOrder(selected);
            }}
            style={{ width: "auto" }}
            value={sortOrder}
          >
            <option value="none">No Sorting (Drag Enabled)</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </Form.Select>
        </div>

        {sortOrder === "none" ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="todos">
              {(provided) => (
                <ul {...provided.droppableProps} ref={provided.innerRef} className="todo-list list-group">
                  {paginatedTodos.map((todo, index) => (
                    <Draggable key={todo._id} draggableId={String(todo._id)} index={index}>
                      {(provided) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="todo-item list-group-item d-flex justify-content-between align-items-center"
                        >
                          <div className="todo-item-content">
                            <input
                              type="checkbox"
                              checked={todo.completed}
                              onChange={() => handleToggleComplete(todo._id, todo.completed)}
                              className="me-2"
                            />
                            <span className={`todo-task ${todo.completed ? "text-decoration-line-through" : ""}`}>
                              {todo.task}
                            </span>
                            <div className="text-muted small">{formatDate(todo.createdAt || todo.updatedAt)}</div>
                          </div>
                          <div className="d-flex gap-2">
                            <Button
                              className="btn btn-sm btn-warning"
                              onClick={() => {
                                setEditingTask(todo);
                                setEditText(todo.task);
                                setShowModal(true);
                              }}
                            >
                              ✏️
                            </Button>
                            <Button className="btn btn-sm btn-danger" onClick={() => handleDelete(todo._id)}>
                              🗑
                            </Button>
                          </div>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <ul className="todo-list list-group">
            {paginatedTodos.map((todo) => (
              <li
                key={todo._id}
                className="todo-item list-group-item d-flex justify-content-between align-items-center"
              >
                <div className="todo-item-content">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => handleToggleComplete(todo._id, todo.completed)}
                    className="me-2"
                  />
                  <span className={`todo-task ${todo.completed ? "text-decoration-line-through" : ""}`}>
                    {todo.task}
                  </span>
                  <div className="text-muted small">{formatDate(todo.createdAt || todo.updatedAt)}</div>
                </div>
                <div className="d-flex gap-2">
                  <Button
                    className="btn btn-sm btn-warning"
                    onClick={() => {
                      setEditingTask(todo);
                      setEditText(todo.task);
                      setShowModal(true);
                    }}
                  >
                    ✏️
                  </Button>
                  <Button className="btn btn-sm btn-danger" onClick={() => handleDelete(todo._id)}>
                    🗑
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="pagination-controls mt-3 d-flex gap-2">
          {[...Array(totalPages)].map((_, i) => (
            <Button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={currentPage === i + 1 ? "btn-dark" : "btn-light"}
            >
              {i + 1}
            </Button>
          ))}
        </div>
      </div>

      {/* Add/Edit Task Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingTask ? "Edit Task" : "Add New Task"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            type="text"
            placeholder="Enter your task"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>{editingTask ? "Update" : "Add Task"}</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Todo;

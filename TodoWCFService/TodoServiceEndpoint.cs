using System;
using System.Collections.Generic;
using System.Linq;
using CoreWCF;
using Todo.TodoWCFService.Models;
using Todo.TodoWCFService.Services;

namespace Todo.TodoWCFService
{
    public class TodoService : ITodoService
    {
        private readonly Services.ITodoService _todoService;

        public TodoService(Services.ITodoService todoService)
        {
            _todoService = todoService ?? throw new ArgumentNullException(nameof(todoService));
        }

        public List<TodoItem> GetTodoItems()
        {
            return _todoService.GetData().ToList();
        }

        public void CreateTodoItem(TodoItem item)
        {
            try
            {
                if (item == null ||
                    string.IsNullOrWhiteSpace(item.Name) ||
                    string.IsNullOrWhiteSpace(item.Notes))
                {
                    throw new FaultException("TodoItem name and notes fields are required");
                }

                // Determine if the ID already exists
                var itemExists = _todoService.DoesItemExist(item.ID);
                if (itemExists)
                {
                    throw new FaultException("TodoItem ID is in use");
                }
                _todoService.InsertData(item);
            }
            catch (Exception ex)
            {
                throw new FaultException(string.Format("Error: {0}", ex.Message));
            }
        }

        public void EditTodoItem(TodoItem item)
        {
            try
            {
                if (item == null ||
                    string.IsNullOrWhiteSpace(item.Name) ||
                    string.IsNullOrWhiteSpace(item.Notes))
                {
                    throw new FaultException("TodoItem name and notes fields are required");
                }

                var todoItem = _todoService.Find(item.ID);
                if (todoItem != null)
                {
                    _todoService.UpdateData(item);
                }
                else
                {
                    throw new FaultException("TodoItem not found");
                }
            }
            catch (Exception ex)
            {
                throw new FaultException(string.Format("Error: {0}", ex.Message));
            }
        }

        public void DeleteTodoItem(string id)
        {
            try
            {
                var todoItem = _todoService.Find(id);
                if (todoItem != null)
                {
                    _todoService.DeleteData(id);
                }
                else
                {
                    throw new FaultException("TodoItem not found");
                }
            }
            catch (Exception ex)
            {
                throw new FaultException(string.Format("Error: {0}", ex.Message));
            }
        }
    }
}

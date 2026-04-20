using System.Collections.Generic;
using CoreWCF;
using Todo.TodoWCFService.Models;

namespace Todo.TodoWCFService
{
    [ServiceContract]
    public interface ITodoService
    {
        [OperationContract]
        List<TodoItem> GetTodoItems();

        [OperationContract]
        void CreateTodoItem(TodoItem item);

        [OperationContract]
        void EditTodoItem(TodoItem item);

        [OperationContract]
        void DeleteTodoItem(string id);
    }
}

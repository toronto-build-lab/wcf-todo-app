using System.ServiceModel;
using TodoCliClient.ServiceReference;

var endpoint = Environment.GetEnvironmentVariable("TODO_SERVICE_URL")
	?? "http://localhost:58332/TodoService.svc";

Console.WriteLine("Todo CLI Client (SOAP)");
Console.WriteLine($"Endpoint: {endpoint}");

while (true)
{
	Console.WriteLine();
	Console.WriteLine("Choose an action:");
	Console.WriteLine("1) List todos");
	Console.WriteLine("2) Create todo");
	Console.WriteLine("3) Edit todo");
	Console.WriteLine("4) Delete todo");
	Console.WriteLine("5) Exit");
	Console.Write("> ");

	var input = Console.ReadLine()?.Trim();
	if (input == "5")
	{
		break;
	}

	try
	{
		using var client = new TodoServiceClient(
			TodoServiceClient.EndpointConfiguration.BasicHttpBinding_ITodoService,
			endpoint);

		switch (input)
		{
			case "1":
				await ListTodosAsync(client);
				break;
			case "2":
				await CreateTodoAsync(client);
				break;
			case "3":
				await EditTodoAsync(client);
				break;
			case "4":
				await DeleteTodoAsync(client);
				break;
			default:
				Console.WriteLine("Unknown option.");
				break;
		}

		await CloseClientAsync(client);
	}
	catch (FaultException ex)
	{
		Console.WriteLine($"Service fault: {ex.Message}");
	}
	catch (CommunicationException ex)
	{
		Console.WriteLine($"Communication error: {ex.Message}");
	}
	catch (TimeoutException ex)
	{
		Console.WriteLine($"Timeout error: {ex.Message}");
	}
	catch (Exception ex)
	{
		Console.WriteLine($"Unexpected error: {ex.Message}");
	}
}

Console.WriteLine("Goodbye.");

static async Task ListTodosAsync(TodoServiceClient client)
{
	var todos = await client.GetTodoItemsAsync();
	if (todos.Length == 0)
	{
		Console.WriteLine("No items found.");
		return;
	}

	Console.WriteLine("Todo items:");
	foreach (var item in todos)
	{
		Console.WriteLine($"- ID: {item.ID}");
		Console.WriteLine($"  Name: {item.Name}");
		Console.WriteLine($"  Notes: {item.Notes}");
		Console.WriteLine($"  Done: {item.Done}");
	}
}

static async Task CreateTodoAsync(TodoServiceClient client)
{
	var name = ReadRequired("Name");
	var notes = ReadRequired("Notes");

	var item = new TodoItem
	{
		ID = Guid.NewGuid().ToString(),
		Name = name,
		Notes = notes,
		Done = false
	};

	await client.CreateTodoItemAsync(item);
	Console.WriteLine($"Created item with ID: {item.ID}");
}

static async Task EditTodoAsync(TodoServiceClient client)
{
	var id = ReadRequired("ID of item to edit");
	var name = ReadRequired("Updated name");
	var notes = ReadRequired("Updated notes");
	var doneInput = ReadOptional("Done? (y/n, blank keeps false)");

	var done = doneInput.Equals("y", StringComparison.OrdinalIgnoreCase)
		|| doneInput.Equals("yes", StringComparison.OrdinalIgnoreCase);

	var item = new TodoItem
	{
		ID = id,
		Name = name,
		Notes = notes,
		Done = done
	};

	await client.EditTodoItemAsync(item);
	Console.WriteLine("Item updated.");
}

static async Task DeleteTodoAsync(TodoServiceClient client)
{
	var id = ReadRequired("ID of item to delete");
	await client.DeleteTodoItemAsync(id);
	Console.WriteLine("Item deleted.");
}

static string ReadRequired(string label)
{
	while (true)
	{
		Console.Write($"{label}: ");
		var value = Console.ReadLine()?.Trim() ?? string.Empty;
		if (!string.IsNullOrWhiteSpace(value))
		{
			return value;
		}

		Console.WriteLine("Value is required.");
	}
}

static string ReadOptional(string label)
{
	Console.Write($"{label}: ");
	return Console.ReadLine()?.Trim() ?? string.Empty;
}

static async Task CloseClientAsync(TodoServiceClient client)
{
	try
	{
		await client.CloseAsync();
	}
	catch
	{
		client.Abort();
	}
}

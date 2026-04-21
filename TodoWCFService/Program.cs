using CoreWCF;
using CoreWCF.Configuration;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Todo.TodoWCFService;

var builder = WebApplication.CreateBuilder(args);

// Register CoreWCF Services
builder.Services.AddServiceModelServices();
builder.Services.AddServiceModelMetadata();

// Register the actual Service Implementation and any Dependencies if required
// Note: CoreWCF resolves services from the ASP.NET Core DI container
builder.Services.AddSingleton<Todo.TodoWCFService.Services.ITodoRepository, Todo.TodoWCFService.Services.TodoRepository>();
builder.Services.AddScoped<Todo.TodoWCFService.Services.ITodoService, Todo.TodoWCFService.Services.TodoService>();
builder.Services.AddTransient<Todo.TodoWCFService.TodoService>();

var app = builder.Build();

app.UseServiceModel(b =>
{
    b.AddService<Todo.TodoWCFService.TodoService>();
    b.AddServiceEndpoint<Todo.TodoWCFService.TodoService, Todo.TodoWCFService.ITodoService>(new BasicHttpBinding(), "/TodoService.svc");

    // Enable generating wsdl exposing the service via metadata
    var serviceMetadataBehavior = app.Services.GetRequiredService<CoreWCF.Description.ServiceMetadataBehavior>();
    serviceMetadataBehavior.HttpGetEnabled = true;
});

app.Run();

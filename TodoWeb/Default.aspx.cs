using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using TodoWeb.ServiceReference;

namespace TodoWeb
{
    public partial class WebForm1 : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {
                BindGrid();
            }
        }

        private void BindGrid()
        {
            TodoServiceClient client = new TodoServiceClient();
            GridView1.DataSource = client.GetTodoItems();
            GridView1.DataBind();
        }

        protected void btnAdd_Click(object sender, EventArgs e)
        {
            TodoServiceClient client = new TodoServiceClient();
            TodoItem newItem = new TodoItem
            {
                ID = Guid.NewGuid().ToString(),
                Name = txtName.Text,
                Notes = txtNotes.Text,
                Done = false
            };

            client.CreateTodoItem(newItem);

            // Clear inputs
            txtName.Text = string.Empty;
            txtNotes.Text = string.Empty;

            // Refresh grid
            BindGrid();
        }

        protected void GridView1_RowDeleting(object sender, GridViewDeleteEventArgs e)
        {
            string id = GridView1.DataKeys[e.RowIndex].Value.ToString();
            TodoServiceClient client = new TodoServiceClient();
            client.DeleteTodoItem(id);

            // Refresh grid
            BindGrid();
        }
    }
}
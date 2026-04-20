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

        protected void GridView1_RowEditing(object sender, GridViewEditEventArgs e)
        {
            GridView1.EditIndex = e.NewEditIndex;
            BindGrid();
        }

        protected void GridView1_RowCancelingEdit(object sender, GridViewCancelEditEventArgs e)
        {
            GridView1.EditIndex = -1;
            BindGrid();
        }

        protected void GridView1_RowUpdating(object sender, GridViewUpdateEventArgs e)
        {
            string id = GridView1.DataKeys[e.RowIndex].Value.ToString();

            // Extract updated values from GridView columns
            GridViewRow row = GridView1.Rows[e.RowIndex];
            string name = ((TextBox)row.Cells[1].Controls[0]).Text;
            string notes = ((TextBox)row.Cells[2].Controls[0]).Text;

            TodoServiceClient client = new TodoServiceClient();

            // Fetch existing to preserve its Done property
            var existingItems = client.GetTodoItems();
            var existingItem = existingItems.FirstOrDefault(i => i.ID == id);
            bool done = existingItem != null ? existingItem.Done : false;

            TodoItem updatedItem = new TodoItem
            {
                ID = id,
                Name = name,
                Notes = notes,
                Done = done
            };

            client.EditTodoItem(updatedItem);

            GridView1.EditIndex = -1;
            BindGrid();
        }
    }
}
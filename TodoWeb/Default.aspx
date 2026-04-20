<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="TodoWeb.WebForm1" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
    <style type="text/css">
        body
        {
            font-family: Arial;
            font-size: 10pt;
        }
        table
        {
            border: 1px solid #ccc;
        }
        table th
        {
            background-color: #F7F7F7;
            color: #333;
            font-weight: bold;
        }
        table th, table td
        {
            padding: 5px;
            border-color: #ccc;
        }
    </style>
</head>
<body>
    <form id="form1" runat="server">
    <asp:GridView ID="GridView1" runat="server" AutoGenerateColumns="false" DataKeyNames="ID" OnRowDeleting="GridView1_RowDeleting">
        <Columns>
            <asp:BoundField DataField="ID" HeaderText="ID" ItemStyle-Width="250" />
            <asp:BoundField DataField="Name" HeaderText="Name" ItemStyle-Width="150" />
            <asp:BoundField DataField="Notes" HeaderText="Notes" ItemStyle-Width="200" />
            <asp:CommandField ShowDeleteButton="True" />
        </Columns>
    </asp:GridView>

    <br />
    <h3>Create New Todo</h3>
    <table border="0" style="border:none;">
        <tr>
            <td style="border:none;">Name:</td>
            <td style="border:none;"><asp:TextBox ID="txtName" runat="server"></asp:TextBox></td>
        </tr>
        <tr>
            <td style="border:none;">Notes:</td>
            <td style="border:none;"><asp:TextBox ID="txtNotes" runat="server"></asp:TextBox></td>
        </tr>
        <tr>
            <td style="border:none;"></td>
            <td style="border:none;">
                <asp:Button ID="btnAdd" runat="server" Text="Add Task" OnClick="btnAdd_Click" />
            </td>
        </tr>
    </table>
    </form>
</body>
</html>

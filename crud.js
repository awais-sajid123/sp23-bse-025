// Function to fetch and display employees
function displayEmployees() {
    $.ajax({
      url: "http://localhost:3000/employees",
      method: "GET",
      dataType: "json",
      success: handleResponse,
      error: function (error) {
        console.error("Error fetching employees:", error);
      },
    });
  }
  
  function handleResponse(data) {
    var employeesList = $("#employeesList");
    employeesList.empty();
  
    $.each(data, function (index, employee) {
      employeesList.append(
        `<div class="mb-3">
              <h3>${employee.name}</h3>
              <div>${employee.description}</div>
              <div>
                  <button class="btn btn-info btn-sm mr-2 btn-edit" data-id="${employee.id}">Edit</button>
                  <button class="btn btn-danger btn-sm btn-del" data-id="${employee.id}">Delete</button>
              </div>
          </div>
          <hr />`
      );
    });
  }
  
  // Function to delete an employee
  function deleteEmployee() {
    let employeeId = $(this).attr("data-id");
    $.ajax({
      url: "http://localhost:3000/employees/" + employeeId,
      method: "DELETE",
      success: function () {
        displayEmployees(); // Refresh the list after deleting an employee
      },
      error: function (error) {
        console.error("Error deleting employee:", error);
      },
    });
  }
  
  // Function to handle form submission
  function handleFormSubmission(event) {
    event.preventDefault();
    let employeeId = $("#createBtn").attr("data-id");
    var name = $("#createName").val();
    var description = $("#createDescription").val();
    
    if (employeeId) {
      // Update existing employee (PUT request)
      $.ajax({
        url: "http://localhost:3000/employees/" + employeeId,
        method: "PUT",
        contentType: "application/json",
        data: JSON.stringify({ name, description }),  // Send data as JSON
        success: function () {
          displayEmployees(); // Refresh the list after updating
          clearForm();
        },
        error: function (error) {
          console.error("Error updating employee:", error);
        },
      });
    } else {
      // Add new employee (POST request)
      $.ajax({
        url: "http://localhost:3000/employees",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ name, description }),  // Send data as JSON
        success: function () {
          displayEmployees();  // Refresh the list after adding a new employee
          clearForm();
        },
        error: function (error) {
          console.error("Error adding employee:", error);
        },
      });
    }
  }
  
  // Function to clear the form and reset the button text
  function clearForm() {
    $("#clearBtn").hide();
    $("#createBtn").removeAttr("data-id");
    $("#createBtn").html("Create");
    $("#createName").val("");
    $("#createDescription").val("");
  }
  
  // Function to handle the edit button click
  function editBtnClicked(event) {
    event.preventDefault();
    let employeeId = $(this).attr("data-id");
    $.ajax({
      url: "http://localhost:3000/employees/" + employeeId,
      method: "GET",
      success: function (data) {
        $("#clearBtn").show();
        $("#createName").val(data.name);
        $("#createDescription").val(data.description);
        $("#createBtn").html("Update");
        $("#createBtn").attr("data-id", data.id);
      },
      error: function (error) {
        console.error("Error fetching employee for editing:", error);
      },
    });
  }
  
  // Document ready function to attach event handlers
  $(document).ready(function () {
    // Initial display of employees
    displayEmployees();
  
    // Attach event handlers
    $(document).on("click", ".btn-del", deleteEmployee);
    $(document).on("click", ".btn-edit", editBtnClicked);
  
    // Handle form submission for creating or updating
    $("#createForm").submit(handleFormSubmission);
  
    // Handle clearing the form
    $("#clearBtn").on("click", function (e) {
      e.preventDefault();
      clearForm();
    });
  });
  
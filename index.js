// Libraries
const express = require('express');
const session = require('express-session');
const mysql = require("mysql")
const path = require("path")
const dotenv = require('dotenv')
const moment = require('moment');
const MySQLStore = require('express-mysql-session')(session);
const hbs = require("hbs");

dotenv.config({ path: './.env' })
const port = 3000;

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
});
const sessionStore = new MySQLStore({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
}, pool);

const CHECK_AUTH = (req, res, next) => {
  const isLoggedIn = req.session && req.session.user;

  if (isLoggedIn) {
    const username = req.session.user;

    const query = 'SELECT type, uid FROM users WHERE username = ?';
    const values = [username];

    SQL_MY(query, values, res, (results) => {
      if (results.length > 0) {
        const userType = results[0].type;
        const userId = results[0].uid;
        if (userType === 1) {
          next();
        } else {
          res.redirect('/dashboard');
        }
      } else {
        res.redirect('/login');
      }
    });
  } else {
    res.redirect('/login');
  }
};

const compareStatus = function (status, comparison) {
  if (status === comparison) {
    return true;
  }
  return false;
};

const SQL_MY = (query, values, res, callback) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting connection from pool:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    connection.query(query, values, (queryError, results) => {
      connection.release();
      if (queryError) {
        console.error('Error executing SQL query:', queryError);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
      callback(results);
    });
  });
};

// Express config
const app = express();
const publicDir = path.join(__dirname, './public')
app.use(express.static(publicDir))
app.use(express.urlencoded({ extended: 'false' }))
app.use(express.json())
app.use(session({
  secret: 'your-secret-key',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
}));
app.set('view engine', 'hbs')
// Register the "eq" helper
hbs.registerHelper("eq", (a, b) => a === b);
hbs.registerHelper('ifCond', function (v1, v2, options) {
  return v1 === v2 ? options.fn(this) : options.inverse(this);
});

function formatDate(date) {
  const options = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  return new Date(date).toLocaleDateString('en-US', options);
}

function getDaysLeft(endDate) {
  const today = new Date();
  const end = new Date(endDate);
  const timeDiff = end - today;
  const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

  return daysLeft >= 0 ? `left ${daysLeft} day${daysLeft > 1 ? 's' : ''}` : 'Completed';
}

app.get('/', (req, res) => {
  res.redirect('/login');
});
app.get('/dashboard', (req, res) => {
  res.render('dashboard');
});
app.get('/login', (req, res) => {
  res.render('login', { title: 'Login Page' });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
  const values = [username, password];
  SQL_MY(query, values, res, (results) => {
    if (results.length > 0) {
      req.session.user = username;
      res.redirect('/employees');
    } else {
      res.render('login', { title: 'Login Page', error: 'Invalid username or password' });
    }
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.redirect('/');
  });
});

// Get all employees
app.get('/employees', CHECK_AUTH, (req, res) => {
  const query = `SELECT * FROM employees 
JOIN departements ON employees.d_id = departements.d_id;
`;
  SQL_MY(query, [], res, (results) => {
    res.render('employees', { result: results });
  });
});

// Get employee data - view page
app.get('/viewProfile/:id', CHECK_AUTH, (req, res) => {
  const employeeId = req.params.id;

  if (employeeId) {
    // Query to fetch employee details from the database
    const query = `
      SELECT e.e_id, e.nom, e.prenom, e.email, e.base_salary, e.experience_years, 
             d.dep_nom AS department_name, z.zone_name 
      FROM employees e
      JOIN departements d ON e.d_id = d.d_id
      JOIN zones z ON e.zone_id = z.zone_id
      WHERE e.e_id = ?
    `;

    // Execute the query with the employee ID
    SQL_MY(query, [employeeId], res, (employeeData) => {
      if (employeeData && employeeData.length > 0) {
        // Render the 'viewProfile' page with employee data
        res.render('viewProfile', { employee: employeeData[0] });
      } else {
        // If no employee found, redirect to 403 or an error page
        res.render('403');
      }
    });
  } else {
    res.render('403');
  }
});

// Get employee data - add page
app.get('/addEmployee', CHECK_AUTH, (req, res) => {
  const departmentQuery = `SELECT d_id, dep_nom FROM departements`;
  const zoneQuery = `SELECT zone_id, zone_name FROM zones`;

  // Fetch departments
  SQL_MY(departmentQuery, [], res, (departments) => {
    // Fetch zones
    SQL_MY(zoneQuery, [], res, (zones) => {
      // Render the addEmployee page with dynamic data
      res.render('addEmployee', {
        departments,
        zones,
      });
    });
  });
});

// Edit Employee Route - edit page
app.get('/edit', CHECK_AUTH, (req, res) => {
  const id = req.query.id;
  if (id !== '') {
    const employeeQuery = "SELECT * FROM employees WHERE e_id = ?";
    const departmentQuery = "SELECT d_id, dep_nom FROM departements";
    const zoneQuery = "SELECT zone_id, zone_name FROM zones";

    // Fetch employee data
    SQL_MY(employeeQuery, [id], res, (employeeResult) => {
      // Fetch department and zone data
      SQL_MY(departmentQuery, [], res, (departments) => {
        SQL_MY(zoneQuery, [], res, (zones) => {
          // Render the edit page with employee, departments, and zones data
          res.render('edit', {
            result: employeeResult[0],
            departments,
            zones
          });
        });
      });
    });
  } else {
    res.render('403');
  }
});

// Edit Emplyee 
app.post('/edit', CHECK_AUTH, (req, res) => {
  const { nom, prenom, email, d_id, zone_id, experience_years, base_salary, eid } = req.body;

  // Check if 'eid' is provided and valid
  if (eid && eid !== '') {
    // Prepare the SQL query with placeholders for parameters
    const query = `
      UPDATE employees
      SET nom = ?, prenom = ?, email = ?, d_id = ?, zone_id = ?, experience_years = ?, base_salary = ?
      WHERE e_id = ?
    `;

    // Execute the query with the provided values
    SQL_MY(query, [nom, prenom, email, d_id, zone_id, experience_years, base_salary, eid], res, (results) => {
      // After the update is successful, render a success message
      res.render('edited', { message: 'Edited Successfully' });
    });
  } else {
    // If 'eid' is not provided, render a forbidden page or an error page
    res.render('403');
  }
});

// Add Employee
app.post('/addEmployee', CHECK_AUTH, (req, res) => {
  const { nom, prenom, email, d_id, zone_id, experience_years, base_salary } = req.body;

  // Insert the new employee into the database
  const insertEmployeeQuery = `
    INSERT INTO employees (nom, prenom, email, d_id, zone_id, experience_years, base_salary) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  // Execute the insert query
  SQL_MY(insertEmployeeQuery, [nom, prenom, email, d_id, zone_id, experience_years, base_salary], res, (results) => {
    // Redirect to the employees list after adding the employee
    res.redirect("/employees");
  });
});

// Suspend Employee
app.post("/suspendEmployee", CHECK_AUTH, (req, res) => {
  const { e_id, suspend } = req.body;

  if (!e_id) {
    return res.status(400).json({ success: false, message: "Employee ID is required." });
  }

  const query = `
    UPDATE employees 
    SET suspended = ? 
    WHERE e_id = ?
  `;
  SQL_MY(query, [suspend ? 1 : 0, e_id], res, (results) => {
    if (results.affectedRows > 0) {
      res.json({ success: true });
    } else {
      res.status(500).json({ success: false, message: "Failed to update employee status." });
    }
  });
});

// Delete Employee
app.post("/deleteEmployee", CHECK_AUTH, (req, res) => {
  const { e_id } = req.body;

  if (!e_id) {
    return res.status(400).json({ success: false, message: "Employee ID is required." });
  }

  const query = `
    DELETE FROM employees 
    WHERE e_id = ?
  `;
  SQL_MY(query, [e_id], res, (results) => {
    if (results.affectedRows > 0) {
      res.json({ success: true });
    } else {
      res.status(500).json({ success: false, message: "Failed to delete employee." });
    }
  });
});

// ======= Leaves Managment ============ //

app.get("/leave-management", (req, res) => {
  const employeesQuery = "SELECT e_id, nom, prenom FROM employees";
  const leaveTypesQuery = "SELECT id, type_name FROM leave_types";
  const leavesQuery = `
    SELECT l.id, l.start_date, l.end_date, l.status, l.reason, 
           CONCAT(e.nom, ' ', e.prenom) AS employee_name, lt.type_name 
    FROM leave_requests l
    JOIN employees e ON l.employee_id = e.e_id
    JOIN leave_types lt ON l.leave_type_id = lt.id
  `;

  SQL_MY(employeesQuery, [], res, (employees) => {
    SQL_MY(leaveTypesQuery, [], res, (leaveTypes) => {
      SQL_MY(leavesQuery, [], res, (leaves) => {
        // Format dates and calculate days left
        leaves.forEach(leave => {
          leave.formatted_start_date = formatDate(leave.start_date);
          leave.formatted_end_date = formatDate(leave.end_date);
          leave.days_left = getDaysLeft(leave.end_date);
        });
        res.render("leave_management", { employees, leaveTypes, leaves });
      });
    });
  });
});

// Request leave
app.post("/leave-management/request", CHECK_AUTH, (req, res) => {
  const { employee_id, leave_type_id, start_date, end_date, reason } = req.body;

  const query = `
    INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, reason) 
    VALUES (?, ?, ?, ?, ?)
  `;

  SQL_MY(query, [employee_id, leave_type_id, start_date, end_date, reason], res, () => {
    res.json({ success: true });
  });
});

// Update leave status
app.post("/leave-management/update-status", CHECK_AUTH, (req, res) => {
  const { id, status } = req.body;

  const query = `
    UPDATE leave_requests 
    SET status = ? 
    WHERE id = ?
  `;

  SQL_MY(query, [status, id], res, () => {
    res.json({ success: true });
  });
});

app.get('/payroll', (req, res) => {
  const employeeQuery = `
      SELECT e.e_id, e.nom, e.prenom, e.base_salary, e.experience_years, 
             z.bonus_value AS zone_bonus
      FROM employees e
      JOIN zones z ON e.zone_id = z.zone_id
  `;

  const contributionsQuery = `SELECT * FROM contributions_and_taxes`;

  const experienceBonusQuery = `
      SELECT experience_years, bonus_percentage
      FROM experience_bonuses
      ORDER BY experience_years
  `;

  // Fetch Employees, Contributions, and Experience Bonus Data
  SQL_MY(employeeQuery, [], res, (employees) => {
    SQL_MY(contributionsQuery, [], res, (contributions) => {
      SQL_MY(experienceBonusQuery, [], res, (experienceBonuses) => {
        // Create a map for experience bonus based on years of experience
        const experienceBonusMap = {};
        experienceBonuses.forEach((bonus) => {
          experienceBonusMap[bonus.experience_years] = bonus.bonus_percentage;
        });

        // Calculate salaries for each employee
        const employeesWithSalary = employees.map((emp) => {
          // Find the highest available bonus percentage for the employee's experience
          let experienceBonusPercentage = 0;
          for (let years = emp.experience_years; years >= 0; years--) {
            if (experienceBonusMap[years] !== undefined) {
              experienceBonusPercentage = experienceBonusMap[years];
              break; // Break once we find the bonus for the experience level
            }
          }

          const experienceBonus = emp.base_salary * (experienceBonusPercentage / 100);
          const totalDeductions = contributions.reduce(
            (sum, contrib) => sum + (emp.base_salary * (contrib.percentage / 100)),
            0
          );
          const totalSalary = emp.base_salary + emp.zone_bonus + experienceBonus - totalDeductions;

          return {
            id: emp.e_id,
            name: `${emp.nom} ${emp.prenom}`,
            baseSalary: emp.base_salary.toFixed(2),
            zoneBonus: emp.zone_bonus.toFixed(2),
            experienceBonus: experienceBonus.toFixed(2),
            totalDeductions: totalDeductions.toFixed(2),
            totalSalary: totalSalary.toFixed(2),
          };
        });

        // Render payroll list with calculated values
        res.render('payroll_list', { employeesWithSalary });
      });
    });
  });
});

// 404 route - not found
app.get('*', (req, res) => {
  res.render('404');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
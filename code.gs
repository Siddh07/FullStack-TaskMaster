// ============================================================
// TaskMaster — Google Apps Script Web App
// Deploy as: Execute as "Me", Access "Anyone"
// ============================================================

// ── Sheet Names ──────────────────────────────────────────────
var SHEET_USERS    = "users";
var SHEET_PROJECTS = "projects";
var SHEET_TASKS    = "tasks";

// ── Column indices (0-based) ─────────────────────────────────
// users:    id | name | email | password | createdAt
// projects: id | userId | name | createdAt
// tasks:    id | projectId | title | completed | createdAt

// ── Entry point ──────────────────────────────────────────────
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action;

    switch (action) {
      // Auth
      case "register":      return register(body);
      case "login":         return login(body);

      // Projects
      case "createProject": return createProject(body);
      case "getProjects":   return getProjects(body);
      case "deleteProject": return deleteProject(body);
      case "shareProject":  return shareProject(body);

      // Tasks
      case "createTask":    return createTask(body);
      case "getTasks":      return getTasks(body);
      case "updateTask":    return updateTask(body);
      case "deleteTask":    return deleteTask(body);

      default:
        return respond({ success: false, message: "Unknown action: " + action }, 400);
    }
  } catch (err) {
    return respond({ success: false, message: "Server error: " + err.message }, 500);
  }
}

// ── Helpers ───────────────────────────────────────────────────

function respond(data, statusCode) {
  var output = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  return output;
}

function getSheet(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    // Seed headers
    if (name === SHEET_USERS)    sheet.appendRow(["id", "name", "email", "password", "createdAt"]);
    if (name === SHEET_PROJECTS) sheet.appendRow(["id", "userId", "name", "createdAt", "sharedWith"]);
    if (name === SHEET_TASKS)    sheet.appendRow(["id", "projectId", "title", "completed", "createdAt"]);
  }
  return sheet;
}

function hashPassword(plain) {
  var bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    plain,
    Utilities.Charset.UTF_8
  );
  return bytes.map(function(b) {
    var hex = (b & 0xFF).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
}

function getRows(sheetName) {
  var sheet = getSheet(sheetName);
  var data = sheet.getDataRange().getValues();
  return data.slice(1); // skip header row
}

function appendRow(sheetName, rowArray) {
  var sheet = getSheet(sheetName);
  sheet.appendRow(rowArray);
}

function deleteRowById(sheetName, id) {
  var sheet = getSheet(sheetName);
  var data = sheet.getDataRange().getValues();
  // data[0] is header, data[1..] are rows
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      sheet.deleteRow(i + 1); // sheet rows are 1-indexed
      return true;
    }
  }
  return false;
}

function findRowById(sheetName, id) {
  var rows = getRows(sheetName);
  for (var i = 0; i < rows.length; i++) {
    if (rows[i][0] == id) return { row: rows[i], index: i + 2 }; // +2: header + 1-indexed
  }
  return null;
}

// ── Auth ──────────────────────────────────────────────────────

function register(body) {
  var name     = body.name     || "";
  var email    = body.email    || "";
  var password = body.password || "";

  if (!name || !email || !password) {
    return respond({ success: false, message: "Name, email, and password are required." });
  }

  // Check duplicate email
  var rows = getRows(SHEET_USERS);
  for (var i = 0; i < rows.length; i++) {
    if (rows[i][2] === email) {
      return respond({ success: false, message: "Email is already registered." });
    }
  }

  var id        = Utilities.getUuid();
  var hashed    = hashPassword(password);
  var createdAt = new Date().toISOString();

  appendRow(SHEET_USERS, [id, name, email, hashed, createdAt]);

  return respond({
    success: true,
    message: "User registered successfully.",
    user: { id: id, name: name, email: email }
  });
}

function login(body) {
  var email    = body.email    || "";
  var password = body.password || "";

  if (!email || !password) {
    return respond({ success: false, message: "Email and password are required." });
  }

  var rows = getRows(SHEET_USERS);
  var hashed = hashPassword(password);

  for (var i = 0; i < rows.length; i++) {
    if (rows[i][2] === email) {
      if (rows[i][3] === hashed) {
        return respond({
          success: true,
          user: {
            id:    rows[i][0],
            name:  rows[i][1],
            email: rows[i][2]
          }
        });
      } else {
        return respond({ success: false, message: "Invalid credentials." });
      }
    }
  }

  return respond({ success: false, message: "Invalid credentials." });
}

// ── Projects ──────────────────────────────────────────────────

function createProject(body) {
  var userId = body.userId || "";
  var name   = body.name   || "";

  if (!userId || !name) {
    return respond({ success: false, message: "userId and name are required." });
  }

  var id        = Utilities.getUuid();
  var createdAt = new Date().toISOString();
  var sharedWith = "[]";

  appendRow(SHEET_PROJECTS, [id, userId, name, createdAt, sharedWith]);

  return respond({
    success: true,
    project: { id: id, userId: userId, name: name, createdAt: createdAt, sharedWith: [] }
  });
}

function getProjects(body) {
  var userId = body.userId || "";
  var userEmail = body.userEmail || "";
  if (!userId) {
    return respond({ success: false, message: "userId is required." });
  }

  var rows = getRows(SHEET_PROJECTS);
  var projects = rows
    .filter(function(r) { 
      var isOwner = (r[1] == userId);
      var sharedList = [];
      try { sharedList = JSON.parse(r[4] || "[]"); } catch(e) {}
      var isShared = (userEmail && sharedList.indexOf(userEmail) !== -1);
      return isOwner || isShared;
    })
    .map(function(r) {
      var sharedList = [];
      try { sharedList = JSON.parse(r[4] || "[]"); } catch(e) {}
      return { id: r[0], userId: r[1], name: r[2], createdAt: r[3], sharedWith: sharedList };
    });

  return respond({ success: true, projects: projects });
}

function deleteProject(body) {
  var projectId = body.projectId || "";
  if (!projectId) {
    return respond({ success: false, message: "projectId is required." });
  }

  // Also delete all tasks for this project
  var taskRows = getRows(SHEET_TASKS);
  var taskSheet = getSheet(SHEET_TASKS);
  // Delete in reverse order to preserve row indices
  var taskData = taskSheet.getDataRange().getValues();
  for (var i = taskData.length - 1; i >= 1; i--) {
    if (taskData[i][1] == projectId) {
      taskSheet.deleteRow(i + 1);
    }
  }

  var deleted = deleteRowById(SHEET_PROJECTS, projectId);
  if (!deleted) {
    return respond({ success: false, message: "Project not found." });
  }

  return respond({ success: true, message: "Project deleted." });
}

function shareProject(body) {
  var projectId     = body.projectId;
  var emailToShare  = body.email;
  var currentUserId = body.userId;

  if (!projectId || !emailToShare || !currentUserId) {
    return respond({ success: false, message: "projectId, email, and userId are required." });
  }

  var found = findRowById(SHEET_PROJECTS, projectId);
  if (!found) return respond({ success: false, message: "Project not found." });

  // Verify ownership
  if (found.row[1] != currentUserId) {
    return respond({ success: false, message: "Only the owner can share this project." });
  }

  var sharedStr = found.row[4] || "[]";
  var sharedArr = [];
  try { sharedArr = JSON.parse(sharedStr); } catch(e) {}

  if (sharedArr.indexOf(emailToShare) === -1) {
    sharedArr.push(emailToShare);
    var sheet = getSheet(SHEET_PROJECTS);
    // 5th column (1-indexed) = "E"
    sheet.getRange(found.index, 5).setValue(JSON.stringify(sharedArr));
  }

  return respond({ success: true, sharedWith: sharedArr });
}

// ── Tasks ─────────────────────────────────────────────────────

function createTask(body) {
  var projectId = body.projectId || "";
  var title     = body.title     || "";

  if (!projectId || !title) {
    return respond({ success: false, message: "projectId and title are required." });
  }

  var id        = Utilities.getUuid();
  var completed = false;
  var createdAt = new Date().toISOString();

  appendRow(SHEET_TASKS, [id, projectId, title, completed, createdAt]);

  return respond({
    success: true,
    task: { id: id, projectId: projectId, title: title, completed: completed, createdAt: createdAt }
  });
}

function getTasks(body) {
  var projectId = body.projectId || "";
  if (!projectId) {
    return respond({ success: false, message: "projectId is required." });
  }

  var rows = getRows(SHEET_TASKS);
  var tasks = rows
    .filter(function(r) { return r[1] == projectId; })
    .map(function(r) {
      return {
        id:        r[0],
        projectId: r[1],
        title:     r[2],
        completed: r[3] === true || r[3] === "TRUE" || r[3] === "true",
        createdAt: r[4]
      };
    });

  return respond({ success: true, tasks: tasks });
}

function updateTask(body) {
  var taskId    = body.taskId    || "";
  var completed = body.completed;

  if (!taskId || completed === undefined) {
    return respond({ success: false, message: "taskId and completed are required." });
  }

  var found = findRowById(SHEET_TASKS, taskId);
  if (!found) {
    return respond({ success: false, message: "Task not found." });
  }

  var sheet   = getSheet(SHEET_TASKS);
  var rowIndex = found.index;

  // completed is column index 4 (1-based column 4 → sheet col D)
  sheet.getRange(rowIndex, 4).setValue(completed);

  return respond({
    success: true,
    task: {
      id:        found.row[0],
      projectId: found.row[1],
      title:     found.row[2],
      completed: completed,
      createdAt: found.row[4]
    }
  });
}

function deleteTask(body) {
  var taskId = body.taskId || "";
  if (!taskId) {
    return respond({ success: false, message: "taskId is required." });
  }

  var deleted = deleteRowById(SHEET_TASKS, taskId);
  if (!deleted) {
    return respond({ success: false, message: "Task not found." });
  }

  return respond({ success: true, message: "Task deleted." });
}

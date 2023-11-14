// I M P O R T    S T A T E M E N T S
import express from 'express';
import pg from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';

//  M O D U L E   S T U F F

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
    user: 'testuser',
    host: 'localhost',
    database: 'singlepage',
    port: 5432,
    password: '123'
})

const app = express();
app.use(express.json());
app.use(express.static('public'));

// P O R T   D E C L A R A T I O N
const port = process.env.PORT || 3000;

// B E G I N
const create = async (req, res, targetType) => {
    const entry = req.body;

    if (targetType !== 'instructors' && targetType !== 'students') {
        res.status(400).send('Invalid Target');
        return;
    }
    try {
        let query, values;
        if (targetType === 'instructors') {
            if ([entry.instructor_name, entry.specialization].includes(undefined)) {
                res.status(400).send('Bad Request.');
                return;
            }

            query = 'INSERT INTO instructors (instructor_name, specialization) VALUES ($1, $2)';
            values = [entry.instructor_name, entry.specialization];
        } else if (targetType === 'students') {
            if ([entry.student_name, entry.instructor_id].includes(undefined)) {
                res.status(400).send('Bad Request.');
                return;
            }

            query = 'INSERT INTO students (student_name, instructor_id) VALUES ($1, $2)';
            values = [entry.student_name, entry.instructor_id];
        }

        // Execute the correct query based on targetType
        const result = await pool.query(query, values);

        // Send the result back to the client
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed.');
    }
};

app.post("/instructors", (req, res) => create(req, res, 'instructors'));
app.post("/students", (req, res) => create(req, res, 'students'));

const read = async (req, res, targetType) => {
  try {
    let query, result;

    if (targetType === 'instructors') {
      const instructorId = req.params.id; 
      if (instructorId) {
        query = 'SELECT * FROM instructors WHERE instructor_id = $1';
        result = await pool.query(query, [instructorId]);
      } else {
        query = 'SELECT * FROM instructors';
        result = await pool.query(query);
      }
    } else if (targetType === 'students') {
      const studentId = req.params.id; 
      if (studentId) {
        query = 'SELECT * FROM students WHERE student_id = $1';
        result = await pool.query(query, [studentId]);
      } else {
        query = 'SELECT * FROM students';
        result = await pool.query(query);
      }
    } else {
      res.status(400).send('Invalid target type.');
      return;
    }

    if (result.rows.length > 0) {
      res.json(result.rows);
    } else {
      send404(req, res);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed read.');
  }
};
app.get("/instructors/:id?", (req, res) => read(req, res, 'instructors'));
app.get("/students/:id?", (req, res) => read(req, res, 'students'));

const update = async (req, res, targetType) => {
    let { index } = req.params;
    index = parseInt(index);
  
    if (index >= 0) {
      const data = req.body;
  
      if (targetType === 'instructors') {
        // Check if required fields for instructors are provided
        if ([data.instructor_name, data.specialization].includes(undefined)) {
          res.status(400).send('Bad Request.');
          return;
        }
  
        try {
          const query = 'UPDATE instructors SET instructor_name = $1, specialization = $2 WHERE instructor_id = $3';
          const values = [data.instructor_name, data.specialization, index];
          const result = await pool.query(query, values);
  
          if (result.rowCount === 0) {
            send404(req, res);
          } else {
            res.send('Success.');
          }
        } catch (error) {
          console.error(error);
          res.status(500).send('Failed.');
        }
  
      } else if (targetType === 'students') {
        // Check if required fields for students are provided
        if ([data.student_name, data.instructor_id].includes(undefined)) {
          res.status(400).send('Bad Request.');
          return;
        }
  
        try {
          const query = 'UPDATE students SET student_name = $1, instructor_id = $2 WHERE student_id = $3';
          const values = [data.student_name, data.instructor_id, index];
          const result = await pool.query(query, values);
  
          if (result.rowCount === 0) {
            send404(req, res);
          } else {
            res.send('Success.');
          }
        } catch (error) {
          console.error(error);
          res.status(500).send('Failed.');
        }
  
      } else {
        res.status(400).send('Invalid target type.');
      }
    } else {
      send404(req, res);
    }
  };
app.put("/instructors/:index", (req, res) => update(req, res, 'instructors'));
app.put("/students/:index", (req, res) => update(req, res, 'students'));

const deleteEntry = async (req, res, targetType) => {
    let { index } = req.params;
    index = parseInt(index);

    if (index >= 0) {
        try {
            let query, values;
            if (targetType === 'instructors') {
                query = 'DELETE FROM instructors WHERE instructor_id = $1';
                values = [index];
            } else if (targetType === 'students') {
                query = 'DELETE FROM students WHERE student_id = $1';
                values = [index];
            } else {
                res.status(400).send('Invalid target type.');
                return;
            }
            const result = await pool.query(query, values);
            if (result.rowCount === 0) {
                send404(req, res);
            } else {
                res.send('Success.');
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to delete entry' });
        }
    } else {
        send404(req, res);
    }
};

app.delete("/instructors/:index", (req, res) => deleteEntry(req, res, 'instructors'));
app.delete("/students/:index", (req, res) => deleteEntry(req, res, 'students'));

const send404 = (req, res) => {
  res.status(404).send("404 Error - Page Not Found");
};
app.use(send404);



// L I S T E N E R
const start = () => {
    app.listen(port, () => {
        console.log(`Server is now running on port ${port}`);
    });
};

// S T A R T   T H E   S E R V E R
start();



const pool = require("../database/");

async function createAppointment(account_id, inv_id, appointment_date) {
  const sql = `
    INSERT INTO appointments (account_id, inv_id, appointment_date)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const result = await pool.query(sql, [account_id, inv_id, appointment_date]);
  return result.rows[0];
}

async function getAppointmentsByAccount(account_id) {
  const sql = `
    SELECT a.appointment_id, a.appointment_date, 
           i.inv_make, i.inv_model
    FROM appointments a
    JOIN inventory i ON a.inv_id = i.inv_id
    WHERE a.account_id = $1
    ORDER BY a.appointment_date DESC;
  `;
  const result = await pool.query(sql, [account_id]);
  return result.rows;
}

async function deleteAppointment(appointment_id) {
    const sql = `
      DELETE FROM appointments
      WHERE appointment_id = $1;
    `;
    const result = await pool.query(sql, [appointment_id]);
    return result.rowCount; // Returns the number of rows deleted
  }

module.exports = { 
    createAppointment, 
    getAppointmentsByAccount,
    deleteAppointment 
};
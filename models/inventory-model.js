const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

/* ***************************
 *  Get specific vehicle details by vehicle_id
 * ************************** */
async function getVehicleById(vehicleId) {
  try {
    const result = await pool.query(
      "SELECT * FROM public.inventory WHERE inv_id = $1", 
      [vehicleId]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error retrieving vehicle by ID:", error);
  }
}

/* ***************************
 *  Add new classification
 * ************************** */
async function insertClassification(classification_name) {
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1)";
    const result = await pool.query(sql, [classification_name]);
    return result.rowCount > 0;
  } catch (error) {
    console.error("Error inserting classification:", error);
    throw error;
  }
};

/* ***************************
 *  Insert New Inventory Item
 * ************************** */
async function insertInventory(item) {
  try {
    const sql = `
      INSERT INTO public.inventory (
        inv_make, inv_model, inv_year, inv_description, 
        inv_image, inv_thumbnail, inv_price, inv_miles, 
        inv_color, classification_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
    const params = [
      item.inv_make,
      item.inv_model,
      item.inv_year,
      item.inv_description,
      item.inv_image,
      item.inv_thumbnail,
      item.inv_price,
      item.inv_miles,
      item.inv_color,
      item.classification_id,
    ];
    const result = await pool.query(sql, params);
    return result.rows[0];
  } catch (error) {
    console.error("Error inserting inventory item:", error);
    throw error;
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById,
  insertClassification,
  insertInventory 
};
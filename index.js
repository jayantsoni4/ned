// const express = require('express');
// const bodyParser = require('body-parser');
// const twilio = require('twilio');
// const mongoose = require('mongoose');
// const app = express();

// // MongoDB Setup (Replace with your MongoDB Atlas URI)
// // const mongoURI = 'mongodb+srv://oshan:oshan%40work1234@cluster0.2txxi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
// mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('Connected to MongoDB Atlas'))
//   .catch(err => console.log('Failed to connect to MongoDB Atlas', err));

// // Define a Complaint schema
// const complaintSchema = new mongoose.Schema({
//   name: String,
//   email: String,
//   address: String,
// });
// const Complaint = mongoose.model('Complaint', complaintSchema);

// // Middleware to parse incoming request body
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

// // Twilio Authentication (Use your actual SID and Auth Token)
// const accountSid = 'AC90eedd3a3a205728db21a529875d59ee';
// const authToken = '3841b2107c425081e13afd697085f4c8';
// const client = twilio(accountSid, authToken);

// // Webhook for incoming WhatsApp messages
// app.post('/webhook', async (req, res) => {
//   const { Body, From } = req.body;
  
//   // If the message contains a name, email, and address
//   const [name, email, address] = Body.split(',');  // Assumes the format is: "name, email, address"
  
//   if (name && email && address) {
//     // Save the complaint data into MongoDB
//     const complaint = new Complaint({ name, email, address });
//     await complaint.save();

//     // Send acknowledgment message back to the user
//     client.messages.create({
//       from: 'whatsapp:+14155238886', // Your Twilio WhatsApp number
//       to: From,  // The number that sent the message
//       body: 'Thank you! Your complaint has been registered successfully.',
//     });

//     res.set('Content-Type', 'application/xml');
//     res.send(`
//       <Response>
//         <Message>Thank you! Your complaint has been registered successfully.</Message>
//       </Response>
//     `);
//   } else {
//     // If the message format is incorrect
//     client.messages.create({
//       from: 'whatsapp:+14155238886',
//       to: From,
//       body: 'Please send your details in the following format: "name, email, address"',
//     });

//     res.set('Content-Type', 'application/xml');
//     res.send(`
//       <Response>
//         <Message>Please send your details in the following format: "name, email, address"</Message>
//       </Response>
//     `);
//   }
// });

// // Start the server
// app.listen(5000, () => {
//   console.log('Server running on port 5000');
// });


/////////////////////////////////////////////////////////////
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

// Initialize Express app
const app = express();
const PORT = 5000;

// Middleware
app.use(cors());  // Allow cross-origin requests
app.use(bodyParser.json());  // Parse incoming JSON bodies

// Mongoose model for Invoice
const invoiceSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  address: { type: String, required: true },
  contactNumber: { type: String, required: true },
  courier: {
    dispatchLocation: { type: String },
    courierName: { type: String },
    status: { type: String, default: 'pending' },
  },
  productDetails: [
    {
      description: { type: String },
      hsnCode: { type: String },
      quantity: { type: Number },
      price: { type: Number },
      igst: { type: Number },
      cgst: { type: Number },
      sgst: { type: Number },
      totalAmount: { type: Number },
    },
  ],
  invoiceType: { type: String, default: 'intra-state' },
});

// Mongoose Model for Invoice
const Invoice = mongoose.model('Invoice', invoiceSchema);

// Connect to MongoDB
mongoose.connect('mongodb+srv://khushsoni839:ks1234@cluster0.u3hib.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

// GET route to fetch all invoices
app.get('/api/invoices', async (req, res) => {
  try {
    const invoices = await Invoice.find();
    res.status(200).json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Error fetching invoices' });
  }
});

// POST route to create a new invoice
app.post('/api/invoices', async (req, res) => {
  const { companyName, address, contactNumber, courier, productDetails, invoiceType } = req.body;

  const newInvoice = new Invoice({
    companyName,
    address,
    contactNumber,
    courier,
    productDetails,
    invoiceType,
  });

  try {
    const savedInvoice = await newInvoice.save();
    res.status(201).json(savedInvoice);
  } catch (error) {
    console.error('Error saving invoice:', error);
    res.status(400).json({ error: 'Error saving invoice' });
  }
});

// PUT route to update an existing invoice
app.put('/api/invoices/:id', async (req, res) => {
  const { id } = req.params;
  const { companyName, address, contactNumber, courier, productDetails, invoiceType } = req.body;

  try {
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      id,
      { companyName, address, contactNumber, courier, productDetails, invoiceType },
      { new: true }  // Return the updated invoice
    );
    res.status(200).json(updatedInvoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(400).json({ error: 'Error updating invoice' });
  }
});

// DELETE route to delete an invoice
app.delete('/api/invoices/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await Invoice.findByIdAndDelete(id);
    res.status(200).json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(400).json({ error: 'Error deleting invoice' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

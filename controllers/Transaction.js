const Transaction = require("../models/Transaction");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const moment = require("moment"); // You might need to install moment.js
const mongoose = require("mongoose");

exports.getMonthlySoldProducts = async (req, res) => {
  try {
    const datas = await Transaction.aggregate([
      {
        $unwind: "$products",
      },
      {
        $group: {
          _id: { month: { $month: "$date" } },
          totalSold: { $sum: "$products.quantity" },
        },
      },
      {
        $sort: { "_id.month": 1 },
      },
    ]);

    let salesData = new Array(12).fill({ totalSold: 0 });
    for (const data of datas) {
        salesData[data._id.month - 1] = data;
    }

    res.status(200).json(salesData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMonthlyImportedProducts = async (req, res) => {
  try {
    const datas = await Product.aggregate([
      {
        $group: {
          _id: { month: { $month: "$creationDate" } },
          totalImported: { $sum: "$quantity" },
        },
      },
      {
        $sort: { "_id.month": 1 },
      },
    ]);

    let importData = new Array(12).fill({ totalImported: 0 });
    for (const data of datas) {
        importData[data._id.month - 1] = data;
    }

    res.status(200).json(importData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

async function calculateProfitForPeriod(start, end) {
  const transactions = await Transaction.find({
    date: { $gte: start, $lte: end },
  }).populate("products.product");

  let profit = 0;
  for (const transaction of transactions) {
    for (const item of transaction.products) {
      const product = await Product.findById(item.product._id); // Fetch each product to get its prices
      const profitPerItem =
        (product.retailPrice - product.importPrice) * item.quantity;
      profit += profitPerItem;
    }
  }

  return profit;
}

exports.calculateTodaysProfit = async (req, res) => {
  const start = moment().startOf("day").toDate();
  const end = moment().endOf("day").toDate();
  const profit = await calculateProfitForPeriod(start, end);
  res.status(200).json({ profit });
};

exports.calculateYesterdaysProfit = async (req, res) => {
  const start = moment().subtract(1, "days").startOf("day").toDate();
  const end = moment().subtract(1, "days").endOf("day").toDate();
  const profit = await calculateProfitForPeriod(start, end);
  res.status(200).json({ profit });
};

exports.calculateLast7DaysProfit = async (req, res) => {
  const start = moment().subtract(7, "days").startOf("day").toDate();
  const end = moment().endOf("day").toDate();
  const profit = await calculateProfitForPeriod(start, end);
  res.status(200).json({ profit });
};

exports.calculateThisMonthsProfit = async (req, res) => {
  const start = moment().startOf("month").toDate();
  const end = moment().endOf("month").toDate();
  const profit = await calculateProfitForPeriod(start, end);
  res.status(200).json({ profit });
};

exports.createTransaction = async (req, res) => {
  const { phoneNumber, totalAmount, amountGiven, address, name, products } =
    req.body;
  console.log(req.body);
  try {
    let customer = await Customer.findOne({ phoneNumber });
    if (!customer) {
      if (!name || !address) {
        return res.status(404).json({ error: "Customer not found" });
      }
      customer = await Customer.create({ phoneNumber, address, name });
    }
    let salesperson = req.session.user._id;
    const newTransaction = new Transaction({
      products,
      customer: customer._id,
      salesperson,
      totalAmount,
      amountGiven,
    });
    await newTransaction.save();

    res.status(201).json(newTransaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTransaction = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      salesperson:req.session.user._id,
    }).populate("products.product customer");

    if (transactions.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate("products.product customer");
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTransactionFive = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      salesperson: req.session.user._id,
    })
      .populate("products.product customer")
      .limit(5);
    if (!transactions) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.listTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({}).populate(
      "products.product customer salesperson"
    );
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.listTransactionsFive = async (req, res) => {
  try {
    const transactions = await Transaction.find({})
      .populate("products.product customer")
      .limit(5);
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).send(error);
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.transactionId,
      req.body,
      { new: true, runValidators: true }
    );
    if (!transaction) {
      return res.status(404).send();
    }
    res.send(transaction);
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(
      req.params.transactionId
    );
    if (!transaction) {
      return res.status(404).send();
    }
    res.send(transaction);
  } catch (error) {
    res.status(500).send(error);
  }
};

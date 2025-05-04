const Product = require('../models/Product');
const Transaction = require('../models/Transaction');

exports.createProduct = async (req, res) => {
    const {name, importPrice, retailPrice, category, quantity} = req.body;
    if (req.file){
        const urlImg = `http://localhost:8080/${req.file.path}`;
        try {
            const barcode = `${name.replace(' ', '_')}_${category}_${Date.now()}`;
            const product = await Product.create({name, image: urlImg, importPrice, retailPrice, category, barcode, quantity});
            res.status(201).json(product);
        } catch (error) {
            res.status(500).json({error : error.message});
        }
    }
    else{
        res.status(500).json({error : "Error"});
    }
};

exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);
        if (!product) {
            return res.status(404).send();
        }
        res.send(product);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.updateProduct = async (req, res) => {
    const {name, importPrice, retailPrice, category, quantity} = req.body;
    if(req.file){
        try {
            const urlImg = `http://localhost:8080/${req.file.path}`;
            const product = await Product.findByIdAndUpdate(req.params.productId, {name, importPrice, retailPrice, category, quantity, image: urlImg}, { new: true });
            if (!product) {
                return res.status(404).json({ error: "Product not found" });
            }
            res.status(200).json(product);
        } catch (error) {
            res.status(400).send(error);
        }
    }
    else {
        try {
            const product = await Product.findByIdAndUpdate(req.params.productId, {name, importPrice, retailPrice, category, quantity}, { new: true });
            if (!product) {
                return res.status(404).json({ error: "Product not found" });
            }
            res.status(200).json(product);
        } catch (error) {
            res.status(400).send(error);
        }
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const tran = await Transaction.find({"products.product": req.params.productId});
        if(tran.length > 0){
            return res.status(400).json({error: "Product is in transaction"});
        }
        const product = await Product.findByIdAndDelete(req.params.productId);
        if (!product) {
            return res.status(404).send();
        }
        res.send(product);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.listProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.status(200).json(products);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: "Product not found"   });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).send(error);
    }
};
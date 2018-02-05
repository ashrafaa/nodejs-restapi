const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Product = require('../models/product');
const servername = 'http://localhost:3000/';

// already been in products route
router.get('/', (req, res, next) => {
    Product.find()
        .select('name price _id')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                products: docs.map(doc => {
                    return {
                        name: doc.name,
                        price: doc.price,
                        _id: doc._id,
                        request: { // to add metadata
                            type: 'GET',
                            url: servername + 'products/' + doc._id
                        }
                    }
                })
            };
            console.log(docs);
            if (docs.length >= 0) {
                res.status(200).json(response);                
            } else {
                res.status(404).json({
                    message: 'No entries found'
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        })
})

router.post('/', (req, res, next) => {
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price
    });
    product
        .save() // store it in database
        .then(result => { // process as promise
            console.log(result);
            res.status(201).json({
                message: 'Created product successfully',
                createdProduct: {
                    name: result.name,
                    price: result.price,
                    _id: result._id,
                    request: {
                        type: 'POST',
                        url: servername + 'products/' + result._id
                    }
                }
            });        
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        }); 

})

router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
        .select('name price _id')
        .exec()
        .then(doc => {
            if (doc) {
                res.status(200).json({
                    product: doc,
                    request: {
                        type: 'GET',
                        url: servername + 'products'
                    }
                });                
            } else {
                res.status(404).json({ message: 'No valid entry found for that id'})
            }
        })
        .catch(err => { 
            console.log(err);
            res.status(500).json({ error: err });
        });
})

router.patch('/:productId', (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    Product.update({ _id: id }, { $set: updateOps })
        .exec()
        .then(result => {
            res.status(200).json({
                product: result,
                request: {
                    type: 'GET',
                    url: servername + 'products/' + id 
                }
            });
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
})

router.delete('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.remove({ _id: id })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Product deleted'
            });
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
})

module.exports = router;
// ANEX A: REST API
// it contains the logic of the REST API endpoints (diapo 32).
 
import Products, { Product } from '@/models/Product';
import connect from '@/lib/mongoose';
import Users, { User } from '@/models/User';
import { Types } from 'mongoose';
//import mongoose, { Types } from 'mongoose';
import Orders, {Order} from '@/models/Order';
// import { NumericLiteral } from 'typescript';
//Prac2
import bcrypt from 'bcrypt';

// GET /api/products
// List of products (without description)
export interface ProductsResponse { 
    products: Product[];
}

export async function getProducts(): Promise<ProductsResponse> {        // mal en snipptes -> ProductsResponse
    await connect();

    const productProjection = {   // _id already included, not necessary
        name: true, 
        price: true, 
        img: true,
    }; 
    const products = await Products.find({}, productProjection);

    return { 
        products: products,
    };
}

// GET /api/products/{productId}
// Find a product by ID 
export interface productResponse {
  name: string;
  price: number;
  img : string;
  description : string; 
}

export async function getProduct(productId: string):  Promise<productResponse | null> {
  await connect();

  const productProjection = {
    name: true,
    price: true,  
    img : true,
    description : true,
  };

  const product = await Products.findById(productId, productProjection);

  if (product === null) {
    return null;
  }

  return product;
}

// GET users
export interface UsersResponse {
  users: User[];
}

export async function getUsers():  Promise<UsersResponse> {
  await connect();

  const userProjection = {
    email: true,
    name: true,
    surname: true,
    address: true,
    birthdate: true,
  };

  const users = await Users.find({}, userProjection);
  
  return {
    users: users,
  };
}

// POST /api/users
// Create a new User
export interface CreateUserResponse {
  _id: Types.ObjectId | string;
}

export async function createUser(user: {
  email: string;
  password: string;
  name: string;
  surname: string;
  address: string;
  birthdate: Date;
}): Promise <CreateUserResponse | null > {
  await connect();
  
  // Check if the email is already in use
  const prevUser = await Users.find({ email: user.email });  
  if (prevUser.length !== 0) {
    return null;
  }
  
  const hash = await bcrypt.hash(user.password, 10);
  const doc: User = {
    ...user,
    password: hash,
    birthdate: new Date(user.birthdate),
    cartItems: [],
    orders: [],
  };

  const newUser = await Users.create(doc);
  
  return {
    _id: newUser._id,
  };
}

// GET /api/users/{userId}
// Find an existing user by ID (without password, orders and cart items)
export interface UserResponse {
    email: string;
    name: string;
    surname: string;
    address: string;
    birthdate: Date;
  }
  
export async function getUser(userId: string):  Promise<UserResponse | null> {
  await connect();
  
  const userProjection = {
    email: true,
    name: true,
    surname: true,
    address: true,
    birthdate: true,
  };
  
  const user = await Users.findById(userId, userProjection);
  if (user === null) {
    return null;
  }
  
  return user;
}

// GET /api/users/{userId}/cart
// List of cart items of an existing user 
export interface CartItemsResponse {
  cartItems: {
    product: {
      _id: Types.ObjectId | string;
      name: string;
      price: number;
    };
    qty: number;
  }[];
}

export async function getCartItems(userId: string): Promise<CartItemsResponse | null> {
  await connect();
  
  const userProjection = {
    _id:false, 
    cartItems: {
      product: true,
      qty: true,
    }
  }
  const productProjection = { 
    name: true, 
    price: true, 
  }; 

  const cartItems = await Users
  .findOne({ _id: userId }, userProjection)
  .populate('cartItems.product', productProjection)
  if(!cartItems){
    return null;
  }

  return cartItems;
}

// PUT /api/users/{userId}/cart/{productId}
// Modify the number of items of a given product in the cart of an existin user.
export interface UpdateCartResponse {
  cartItems: Types.ObjectId[];
  createdOrUpdated : boolean;
}

export async function UpdateCartItem(
  userId: string,
  productId: string,
  qty: number
): Promise<UpdateCartResponse | null> {
  await connect();

  var createdOrUpdated = false;
  
  // Check if the user or the product exists.
  const user = await Users.findById(userId);
  const product = await getProduct(productId);
  if (user === null || product === null) {
    return null;
  }

  const cartItem = user.cartItems.find((cartItem: any) =>
    cartItem.product._id.equals(productId)  // Check if productID in carItem is == productID
  );

  // Find if there's a cartItem in carProduct
  if (cartItem) {
    cartItem.qty = qty;
  } else {  // If the product does not exist in the cart.
    createdOrUpdated = true;
    const newCartItem = {
      product: new Types.ObjectId(productId),
      qty: qty,
    };
    user.cartItems.push(newCartItem);
  }

   // Commit the changes in the database (user).
  await user.save();

  // Return to the method PUT in route.ts also the variable CreatedorUpdated.
  const updateResponse: UpdateCartResponse = {
    cartItems: user.cartItems.map((item: any) => item.product),
    createdOrUpdated, // Include the CreatedorUpdated variable in the response.
  };
  
  return updateResponse;
}

// DELETE /api/users/{userId}/cart/{productId}
// Remove a product from the cart of an existing user 
export interface DeleteProductResponse{
  cartItems: {
    product: {
      _id: Types.ObjectId | string;
      name: string;
      price: number;
    };
    qty: number;
  }[];
}

export async function deleteProduct(userId: string, productId: string): Promise<DeleteProductResponse | null> {
  await connect();

  const user = await Users.findById(userId);
  if (!user) {return null;}
  const product = await Products.findById(productId);
  if (!product) {return null;}
    
  const updatedCart = await Users.findByIdAndUpdate(userId,
    {
      // Delete an element from "carItems" that has an object "product" with "productId" given.
      $pull: { cartItems: { product: productId } }, //WITH pull we extract the product from the cartItems 
    }
  );
  if(updatedCart === null) {return null;}

  const cartItems = await getCartItems(userId);
  
  return cartItems;    
}

// GET /api/users/{userId}/orders
// List of orders of an existing user.
// export interface OrdersResponse {
//   orders: {
//     _id?: Types.ObjectId;
//     address?: string;
//     date: Date;
//     cardHolder?: string;
//     cardNumber: string;
//   }[];
//   // address: string;
//   // date: Date;
//   // cardHolder?: string;
//   // cardNumber: string;
// }

// export async function getOrders(userId: string): Promise<OrdersResponse | null> {
//   await connect();
  
//   const userProjection = {
//     _id:false, 
//     orders: {
//       address : true,
//       date: true,
//       cardHolder : true, 
//       cardNumber : true
//     }
//   }
 
//   const orders = await Users
//   .findOne({ _id: userId }, userProjection)

//   return orders;
// }

export interface OrdersResponse {
  address: string;
  date: Date;
  cardHolder?: string;
  cardNumber: string;
  
}

export async function getOrders(userId: string): Promise<OrdersResponse[] | null> {
await connect();


const userProjection = {
  _id:false, 
  email: false,
  password:false,
  name: false,
  surname: false,
  address: false,
  birthdate:false,
  cartItems:false,
  __v : false
};

const orderProjection = {
  address : true,
  date: true,
  cardHolder : true, 
  cardNumber : true,
  
};

const user = await Users.findById(userId);


//To manage the user and the product if  they don't exist.
if (user === null) {
  return null;
}

const orders = await Users.findById(userId,userProjection).populate(
  'orders',orderProjection
);


return orders
}



// POST /api/users/{userId}/orders
// Create a new order for an existing user.
export interface CreateOrderResponse {
  _id: Types.ObjectId | string;
}

export async function createOrder(
  userId: string, 
  order: {
    address: string;
    cardHolder: string;
    cardNumber: string;
  }
): Promise<CreateOrderResponse | null> {
  
  // Check if the user exists
  const user = await Users.findById(userId);
  if (user === null) {
    return null;
  }
  if (user.cartItems == 0) {
    return null;
  }  

  // Create the order with the params and add the date.  
  const doc : Order = {
    ...order,
    date: new Date(),
    orderItems: []
  };
  const newOrder = new Orders(doc);
  newOrder.orderItems = await Promise.all(user.cartItems.map(async (item: any) => {
    const product = await Products.findById(item.product._id.toString());
    if (product) {
      return {
        product: item.product._id,
        qty: item.qty,
        price: product.price
      };
    }
  }));
  await newOrder.save();

  // We put the order just created in the user. 
  user.orders.push(newOrder);

  user.cartItems = [];
  
  // Save the user that has the new order.
  await user.save();
  
  return {
    _id: newOrder._id,
  };
}

// GET /api/users/{userId}/orders/{orderId}
// Find an existing order of a user by ID.
export interface OrderResponse {
  order: Order;
}

export async function getOrder(userId: string, orderId: string) : Promise< OrderResponse | null>  {
  await connect();

  const orderProjection = {
    _id: true,
    date: true,
    address: true,
    cardHolder: true,
    cardNumber: true,
    orderItems: {
      product: true,
      qty: true,
      price: true,
    },
  };

  const productProjection = {
    _id: true,
    name: true,
  };

  const user = await Users.findOne({ _id: userId });
  if(!user){
    return null;
  }

  //const order = user.orders.includes(orderId);
  const order = user.orders.find((orderItem: any) =>
    orderItem._id.equals(orderId)
  );
  if (!order) {
    return null;
  }

  const orderById = await Orders.findOne(
    { _id: orderId },
    orderProjection
  ).populate('orderItems.product', productProjection);

  return orderById;
}
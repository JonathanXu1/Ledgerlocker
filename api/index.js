const express = require("express");
const cors = require("cors");
const app = express();
const { request } = require("graphql-request");
var server = require("http").createServer(app);
var io = require("socket.io")(server);

const web3 = require("web3");
const Tx = require("ethereumjs-tx").Transaction;

// Admin user
const privateKey =
  "d72c3e39f07665c8594ed6354d9c3f528f501fa8bda627be548c1ace7b3dc28e";
const address = "0xA5A4E75ED687E45deC203abB3b1a14516D1078D0";

// Contract info
const privateKeyHex = Buffer.from(privateKey, "hex");
const contractABI = [
  {
    constant: true,
    inputs: [
      {
        name: "_id",
        type: "uint256"
      }
    ],
    name: "getListing",
    outputs: [
      {
        name: "_price",
        type: "uint256"
      },
      {
        name: "_timestamp",
        type: "uint256"
      },
      {
        name: "_renter",
        type: "address"
      },
      {
        name: "_owner",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "vat",
    outputs: [
      {
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "pot",
    outputs: [
      {
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_seconds",
        type: "uint256"
      }
    ],
    name: "setSecondsPerBlock",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [],
    name: "createVote",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "getTotalUserBalance",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "_address",
        type: "address"
      }
    ],
    name: "getWithdrawableBalance",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "getAdminAccountBalance",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "owner",
    outputs: [
      {
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "isOwner",
    outputs: [
      {
        name: "",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "_address",
        type: "address"
      }
    ],
    name: "getAccountBalance",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_id",
        type: "uint256"
      },
      {
        name: "_price",
        type: "uint256"
      }
    ],
    name: "createListing",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "_duration",
        type: "uint256"
      }
    ],
    name: "getFutureTimestamp",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "balance",
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "daiToken",
    outputs: [
      {
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "daiJoin",
    outputs: [
      {
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "newOwner",
        type: "address"
      }
    ],
    name: "transferOwnership",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_id",
        type: "uint256"
      },
      {
        name: "_duration",
        type: "uint256"
      }
    ],
    name: "bookListing",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        name: "_id",
        type: "uint256"
      }
    ],
    name: "endListing",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: "_id",
        type: "uint256"
      },
      {
        indexed: false,
        name: "_price",
        type: "uint256"
      },
      {
        indexed: false,
        name: "_timestamp",
        type: "uint256"
      },
      {
        indexed: false,
        name: "_renter",
        type: "address"
      },
      {
        indexed: false,
        name: "_owner",
        type: "address"
      }
    ],
    name: "listingBooked",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        name: "_id",
        type: "uint256"
      },
      {
        indexed: false,
        name: "_price",
        type: "uint256"
      },
      {
        indexed: false,
        name: "_timestamp",
        type: "uint256"
      },
      {
        indexed: false,
        name: "_renter",
        type: "address"
      },
      {
        indexed: false,
        name: "_owner",
        type: "address"
      }
    ],
    name: "listingClosed",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "previousOwner",
        type: "address"
      },
      {
        indexed: true,
        name: "newOwner",
        type: "address"
      }
    ],
    name: "OwnershipTransferred",
    type: "event"
  }
];
const contractAddress = "0xE6023B2DaA371AB5fda43E12C4b2BbB86C0955f6";

// web3js = new web3("https://shared-parity-kovan.nodes.deploy.radar.tech/?apikey=aa471b3aef7702ef45419b6b784f0dfc7d7575f01fef1cab");
web3js = new web3(
  "https://kovan.infura.io/v3/b08e31ca292b465d8ddb30d57921c756"
);

const createListing = (id, price) => {
  var contract = new web3js.eth.Contract(contractABI, contractAddress);

  web3js.eth.getBalance("0xA5A4E75ED687E45deC203abB3b1a14516D1078D0", function(
    err,
    result
  ) {
    if (err) {
      console.log(err);
    } else {
      console.log(web3.utils.fromWei(result, "ether") + " ETH");
    }
  });

  // FROM https://medium.com/coinmonks/ethereum-tutorial-sending-transaction-via-nodejs-backend-7b623b885707
  var count;
  // get transaction count, later will used as nonce
  web3js.eth.getTransactionCount(address).then(function(v) {
    console.log("Count: " + v);
    count = v;
    //creating raw tranaction
    var rawTransaction = {
      from: address,
      gasPrice: web3js.utils.toHex(60 * 10e9),
      gasLimit: web3js.utils.toHex(500000),
      to: contractAddress,
      value: "0x0",
      data: contract.methods.createListing(id, price).encodeABI(),
      nonce: web3js.utils.toHex(count)
    };
    console.log(rawTransaction);
    //creating tranaction via ethereumjs-tx
    var transaction = new Tx(rawTransaction, { chain: "kovan" });
    //signing transaction with private key
    transaction.sign(privateKeyHex);
    //sending transacton via web3js module
    web3js.eth
      .sendSignedTransaction("0x" + transaction.serialize().toString("hex"))
      .on("transactionHash", console.log)
      .on("receipt", console.log);
  });

  console.log("Listing created");
};

const graphQLQuery = `{
  listings {
    id
    listingId
    price
    timestamp
    renter
    owner
    eventType
  }
}
`;

app.use(cors());
app.use(express.json());

var locked;
var doorClosed;

io.on("connection", function(socket) {
  console.log("Lock connected. Sending new code...");
  var val = Math.floor(1000 + Math.random() * 9000);
  io.sockets.emit("idState", val);
  console.log("Sent code ", val);

  socket.on("postLock", function(value) {
    console.log("Lock: " + value);
    locked = value; //locked or unlocked
  });

  socket.on("postDoor", function(value) {
    console.log("Door: " + value);
    doorClosed = value; // closed or open
  });

  socket.on("disconnect", function() {
    console.log("Lock disconnected");
  });
});

app.post("/api/unlock/", function(req, res) {
  if (locked === "locked") {
    io.sockets.emit("lockState", "unlock");
    res.sendStatus(200);
  }
});

app.post("/api/lock/", function(req, res) {
  if (locked === "unlocked") {
    io.sockets.emit("lockState", "lock");
    res.sendStatus(200);
  }
});

app.post("/api/changeID", function(req, res) {
  io.sockets.emit("idState", req.body.id);
  res.sendStatus(200);
});

app.post("/api/checkin", function(req, res) {
  res.sendStatus(200);
});

app.post("/api/checkout", function(req, res) {
  res.sendStatus(200);
});

app.get("/api/listings/booked", async function(req, res) {
  var data = await request(
    "https://api.thegraph.com/subgraphs/name/haardikk21/ledgerlocker",
    graphQLQuery
  );

  var listings = [];

  data.listings.forEach(listing => {
    if (listing.eventType === "booking") {
      listings.push(listing);
    }
  });

  res.json(listings);
});

app.get("/api/listings", function(req, res) {
  const listings = [
    {
      name: "Lovely Micro-Studio in Forest Park, GA",
      id: 1,
      address: "Forest Park, GA",
      rent: "45 DAI/day",
      booked: true,
      stake: 2,
      renter: "0xsdkjfn3r289ry2930fosdfln2309rj23ffon3wf",
      owner: "0xd02b00EFd6E38d7735C7b1793edD6379E8BF5efB",
      description:
        "123 Broadway, Denver near ABC Mall. Walking score 95, with everything you can want within 5 minutes walking distance. House was just renovated and has hardwood floors, new kitchen appliances, and renovated bathrooms. A great place to call it your home!",

      images: [
        "https://www.padsplit.com/img/rooms/room_866_0_1578610474.769763.jpg",
        "https://www.padsplit.com/img/rooms/room_866_1_1578610474.769763.jpg",
        "https://www.padsplit.com/img/psproperty/psproperty_158_4_1578610474.769763.jpg",
        "https://www.padsplit.com/img/psproperty/psproperty_158_3_1578610474.769763.jpg",
        "https://www.padsplit.com/img/psproperty/psproperty_158_2_1578610474.769763.jpg",
        "https://www.padsplit.com/img/psproperty/psproperty_158_1_1578610474.769763.jpg",
        "https://www.padsplit.com/img/psproperty/psproperty_158_0_1578610474.769763.jpg"
      ]
    },
    {
      name: "Cosy Apartment in Denver, CO",
      id: 2,
      address: "Denver, CO",
      rent: "50 DAI/day",
      booked: true,
      renter: "0xd02b00EFd6E38d7735C7b1793edD6379E8BF5efB",
      stake: 2,
      owner: "0xed7c62124138144e42ddd57dd4cd20e9416a688f",
      description:
        "123 Broadway, Denver near ABC Mall. Walking score 95, with everything you can want within 5 minutes walking distance. House was just renovated and has hardwood floors, new kitchen appliances, and renovated bathrooms. A great place to call it your home!",

      images: [
        "https://www.padsplit.com/img/rooms/room_866_0_1578610474.769763.jpg",
        "https://www.padsplit.com/img/rooms/room_866_1_1578610474.769763.jpg",
        "https://www.padsplit.com/img/psproperty/psproperty_158_4_1578610474.769763.jpg",
        "https://www.padsplit.com/img/psproperty/psproperty_158_3_1578610474.769763.jpg",
        "https://www.padsplit.com/img/psproperty/psproperty_158_2_1578610474.769763.jpg",
        "https://www.padsplit.com/img/psproperty/psproperty_158_1_1578610474.769763.jpg",
        "https://www.padsplit.com/img/psproperty/psproperty_158_0_1578610474.769763.jpg"
      ]
    }
  ];

  res.send(listings);
});

app.get("/api/createListing/:id/:price", async function(req, res) {
  createListing(req.params.id, req.params.price);
});

server.listen(3001, () => console.log("API listening on port 3001"));

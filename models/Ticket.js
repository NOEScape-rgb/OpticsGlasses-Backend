const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      // User is optional if it's a guest ticket
    },
    email: {
      type: String,
      required: [true, "Email is required for the ticket"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    subject: {
      type: String,
      required: [true, "Ticket subject is required"],
      trim: true,
      minlength: 5,
      maxlength: 200,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Low",
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      default: "Open",
    },
    messages: [
      {
        sender: {
          type: String,
          enum: ["admin", "customer"],
          required: true,
        },
        message: {
          type: String,
          required: true,
          trim: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
    collection: "tickets",
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Populate user details on find
ticketSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "firstName lastName email", // Only select relevant user fields
  });
  next();
});

const Ticket = mongoose.model("Ticket", ticketSchema);

module.exports = Ticket;

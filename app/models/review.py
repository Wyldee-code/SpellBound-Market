from .db import db, add_prefix_for_prod, SCHEMA, environment

class Review(db.Model):
    __tablename__ = 'reviews'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    comment = db.Column(db.String(255), nullable=False)
    rating = db.Column(db.Integer, nullable=False)

    product_id = db.Column(
        db.Integer,
        db.ForeignKey(add_prefix_for_prod("products.id")),
        nullable=False
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey(add_prefix_for_prod("users.id")),
        nullable=False
    )

    user = db.relationship("User", backref="reviews")
    product = db.relationship("Product", back_populates="reviews")

    def to_dict(self):
        return {
            "id": self.id,
            "comment": self.comment,
            "rating": self.rating,
            "product_id": self.product_id,
            "user_id": self.user_id
        }

"""
Scikit-Learn Machine Learning Model for Fraud Detection

Uses a Random Forest Classifier trained on synthetic transaction
behavioral features.

The model also calculates:
- Accuracy
- Precision
- Recall
- F1 Score
"""

import numpy as np

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score


class FraudMLModel:

    def __init__(self):
        self.model = RandomForestClassifier(
            n_estimators=50,
            random_state=42
        )

        self.is_trained = False

        self.metrics = {
            "accuracy": 0.0,
            "precision": 0.0,
            "recall": 0.0,
            "f1_score": 0.0
        }

        self._train_initial_model()

    def _train_initial_model(self):
        """
        Train the Random Forest model using synthetic transaction data.

        Features:
        [amount, is_new_device, is_unusual_location, recent_tx_count]
        """

        np.random.seed(42)

        normal_samples = 600
        fraud_samples = 150

        # -----------------------------
        # NORMAL TRANSACTIONS
        # -----------------------------

        normal_amounts = np.random.exponential(
            scale=3500,
            size=normal_samples
        )

        normal_devices = np.random.binomial(
            n=1,
            p=0.08,
            size=normal_samples
        )

        normal_locs = np.random.binomial(
            n=1,
            p=0.06,
            size=normal_samples
        )

        normal_velocity = np.random.poisson(
            lam=1.2,
            size=normal_samples
        )

        y_normal = np.zeros(normal_samples)

        X_normal = np.column_stack([
            normal_amounts,
            normal_devices,
            normal_locs,
            normal_velocity
        ])

        # -----------------------------
        # FRAUDULENT TRANSACTIONS
        # -----------------------------

        fraud_amounts = np.random.uniform(
            low=45000,
            high=150000,
            size=fraud_samples
        )

        fraud_devices = np.random.binomial(
            n=1,
            p=0.85,
            size=fraud_samples
        )

        fraud_locs = np.random.binomial(
            n=1,
            p=0.80,
            size=fraud_samples
        )

        fraud_velocity = np.random.poisson(
            lam=6.5,
            size=fraud_samples
        )

        y_fraud = np.ones(fraud_samples)

        X_fraud = np.column_stack([
            fraud_amounts,
            fraud_devices,
            fraud_locs,
            fraud_velocity
        ])

        # -----------------------------
        # COMBINE DATA
        # -----------------------------

        X = np.vstack([
            X_normal,
            X_fraud
        ])

        y = np.concatenate([
            y_normal,
            y_fraud
        ])

        # -----------------------------
        # TRAIN / TEST SPLIT
        # -----------------------------

        X_train, X_test, y_train, y_test = train_test_split(
            X,
            y,
            test_size=0.20,
            random_state=42,
            stratify=y
        )

        # -----------------------------
        # TRAIN MODEL
        # -----------------------------

        self.model.fit(
            X_train,
            y_train
        )

        # -----------------------------
        # EVALUATE MODEL
        # -----------------------------

        y_pred = self.model.predict(X_test)

        self.metrics = {
            "accuracy": round(
                accuracy_score(y_test, y_pred) * 100,
                2
            ),

            "precision": round(
                precision_score(y_test, y_pred, zero_division=0) * 100,
                2
            ),

            "recall": round(
                recall_score(y_test, y_pred, zero_division=0) * 100,
                2
            ),

            "f1_score": round(
                f1_score(y_test, y_pred, zero_division=0) * 100,
                2
            )
        }

        self.is_trained = True

    def predict(
        self,
        amount: float,
        is_new_device: bool,
        is_unusual_loc: bool,
        recent_tx_count: int
    ) -> dict:

        """
        Predict fraud likelihood for a new transaction.
        """

        features = np.array([[
            float(amount),

            1.0 if is_new_device else 0.0,

            1.0 if is_unusual_loc else 0.0,

            float(recent_tx_count)
        ]])

        probs = self.model.predict_proba(features)[0]

        fraud_prob = float(probs[1]) * 100.0

        if fraud_prob >= 70.0:

            pred = "FRAUD"

        elif fraud_prob >= 40.0:

            pred = "SUSPICIOUS"

        else:

            pred = "LEGITIMATE"

        return {
            "ml_anomaly_score": round(
                fraud_prob,
                1
            ),

            "ml_prediction": pred
        }

    def get_metrics(self) -> dict:
        """
        Return model evaluation metrics.
        """

        return self.metrics


# Global ML model instance
fraud_detector_ml = FraudMLModel()
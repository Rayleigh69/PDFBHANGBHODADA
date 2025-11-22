"""
Shared dependencies for FastAPI routes.
Includes optional Clerk token verification.
"""
from fastapi import Depends, HTTPException, status, Header
from typing import Optional

# TODO: Install clerk-sdk-python for backend verification
# pip install clerk-sdk-python
# Then uncomment and configure:

# from clerk_backend_sdk import Clerk
# import os

# clerk_client = Clerk(bearer_auth=os.getenv("CLERK_SECRET_KEY"))

# async def verify_clerk_token(
#     authorization: Optional[str] = Header(None)
# ):
#     """
#     Verify Clerk JWT token from Authorization header.
#     Returns the user ID if valid, raises 401 if invalid.
#     """
#     if not authorization:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Missing Authorization header"
#         )
#     
#     try:
#         # Extract token from "Bearer <token>"
#         token = authorization.replace("Bearer ", "")
#         
#         # Verify token with Clerk
#         # This is a placeholder - actual implementation depends on clerk-sdk-python
#         # user_id = clerk_client.verify_token(token)
#         
#         # For now, return a placeholder
#         return {"user_id": "placeholder"}
#     except Exception as e:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail=f"Invalid token: {str(e)}"
#         )

# Example usage in a protected route:
# @app.post("/api/protected-endpoint")
# async def protected_endpoint(user: dict = Depends(verify_clerk_token)):
#     user_id = user["user_id"]
#     # ... your logic here

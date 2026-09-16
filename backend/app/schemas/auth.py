from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserPublic"


class UserPublic(BaseModel):
    id: str
    name: str
    email: EmailStr
    plan: str = "free"
    role: str = "user"
    created_at: str


TokenResponse.model_rebuild()

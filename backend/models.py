from typing import Optional, List
from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    password_confirm: str

class User(BaseModel):
    id: str
    username: str
    email: EmailStr
    role: str
    is_active: bool
    is_email_verified: bool

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class CategoryCreate(BaseModel):
    name: str
    parent: Optional[str] = None

class Category(BaseModel):
    id: str
    name: str
    parent: Optional[str] = None

class Media(BaseModel):
    id: str
    filename: str
    content_type: str
    size: int
    url: str

class RaporCreate(BaseModel):
    ekipman_adi: str
    kategori_id: str
    firma: str
    project_id: Optional[str] = None
    lokasyon: Optional[str] = None
    project_city: Optional[str] = None
    project_district: Optional[str] = None
    marka_model: Optional[str] = None
    seri_no: Optional[str] = None
    alt_kategori: Optional[str] = None
    periyot: Optional[int] = None
    gecerlilik_tarihi: Optional[str] = None
    aciklama: Optional[str] = None
    uygunluk_durumu: Optional[str] = None

class Rapor(BaseModel):
    id: str
    rapor_no: str
    ekipman_adi: str
    kategori_id: str
    firma: str
    project_id: Optional[str] = None
    lokasyon: Optional[str] = None
    project_city: Optional[str] = None
    project_district: Optional[str] = None
    marka_model: Optional[str] = None
    seri_no: Optional[str] = None
    alt_kategori: Optional[str] = None
    periyot: Optional[int] = None
    gecerlilik_tarihi: Optional[str] = None
    aciklama: Optional[str] = None
    uygunluk_durumu: Optional[str] = None
    olusturan_username: str
    medyalar: List[Media] = []

class VerifyEmailRequest(BaseModel):
    email: EmailStr
    token: str

class UserAdminCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: Optional[str] = "inspector"

class UserListItem(BaseModel):
    id: str
    username: str
    email: EmailStr
    role: str

class ProjectCreate(BaseModel):
    name: str

class Project(BaseModel):
    id: str
    name: str

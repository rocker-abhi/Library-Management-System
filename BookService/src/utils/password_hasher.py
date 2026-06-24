from argon2 import PasswordHasher

ph = PasswordHasher()

def hash_password(password:str)->str:
    return ph.hash(password)

def verify_password(hash_password:str, password:str)->bool:
    return ph.verify(hash_password, password)

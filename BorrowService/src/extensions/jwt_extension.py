from enum import global_enum
import jwt

class JWT_Manager:
    __secreat = None
    __algorithm = None
    __access_token_expiration_time = None
    __refresh_token_expiration_time = None
    

    @classmethod
    def __init_app__(cls, secreat, algorithmn, access_token_expiration_time, refresh_token_expiration_time):
        cls.__secreat = secreat
        cls.__algorithm = algorithmn
        cls.__access_token_expiration_time = access_token_expiration_time
        cls.__refresh_token_expiration_time = refresh_token_expiration_time
    
    @classmethod
    def get_jwt_keys(cls):
        if not cls.__secreat or not cls.__algorithm or not cls.__access_token_expiration_time or not cls.__refresh_token_expiration_time:
            raise ValueError("JWT secret key is not set")
        return {
            "secret": cls.__secreat,
            "algorithm": cls.__algorithm,
            "access_token_expiration_time": cls.__access_token_expiration_time,
            "refresh_token_expiration_time": cls.__refresh_token_expiration_time    
        }

__jwt_manager = JWT_Manager()

def setup_jwt_manager(secreat, algorith, access_token_lifespan, refresh_token_lifespan):
    global __jwt_manager
    __jwt_manager.__init_app__(secreat, algorith, access_token_lifespan, refresh_token_lifespan)

def get_jwt_keys():
    global __jwt_manager
    return __jwt_manager.get_jwt_keys()
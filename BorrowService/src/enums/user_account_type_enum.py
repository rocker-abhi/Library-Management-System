from enum import Enum

class UserAccountTypeEnum(str, Enum):
    admin = "ADMIN"
    supervisor = "SUPERVISOR"
    customer = "CUSTOMER"
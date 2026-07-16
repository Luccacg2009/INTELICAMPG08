import hashlib
import getpass
import os
from pathlib import Path
from meeting_ai.config import config

CONFIG_DIR = Path.home() / ".meeting_ai"
PASSWORD_FILE = CONFIG_DIR / ".auth"
DEFAULT_PASSWORD = "azul123"


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(password: str) -> bool:
    if not PASSWORD_FILE.exists():
        return hash_password(password) == hash_password(DEFAULT_PASSWORD)
    
    stored_hash = PASSWORD_FILE.read_text().strip()
    return hash_password(password) == stored_hash


def set_password(new_password: str):
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    PASSWORD_FILE.write_text(hash_password(new_password))
    PASSWORD_FILE.chmod(0o600)


def is_first_run() -> bool:
    return not PASSWORD_FILE.exists()


def prompt_password(max_attempts: int = 3) -> bool:
    """Solicita senha com tentativas limitadas."""
    print("\n" + "=" * 50)
    print("   MEETING AI - ACESSO RESTRITO")
    print("   Apenas tomadores de decisão (incl. outras verticais)")
    print("=" * 50)
    
    for attempt in range(1, max_attempts + 1):
        pwd = getpass.getpass(f"Senha (tentativa {attempt}/{max_attempts}): ").strip()
        if verify_password(pwd):
            print("✓ Acesso autorizado\n")
            return True
        else:
            remaining = max_attempts - attempt
            if remaining > 0:
                print(f"✗ Senha incorreta. {remaining} tentativa(s) restante(s).\n")
            else:
                print("\n✗ Número máximo de tentativas excedido. Acesso negado.")
                return False
    return False


def change_password_interactive() -> bool:
    """Altera a senha interativamente."""
    print("\n" + "=" * 50)
    print("ALTERAR SENHA")
    print("=" * 50)
    
    # Verifica senha atual
    for attempt in range(3):
        current = getpass.getpass("Senha atual: ").strip()
        if verify_password(current):
            break
        print(f"Senha incorreta. Tentativas restantes: {2 - attempt}")
    else:
        print("Muitas tentativas falhas.")
        return False
    
    # Nova senha
    while True:
        pwd1 = getpass.getpass("Nova senha: ").strip()
        if not pwd1:
            print("Senha não pode ser vazia.")
            continue
        pwd2 = getpass.getpass("Confirme a nova senha: ").strip()
        if pwd1 != pwd2:
            print("Senhas não conferem.")
            continue
        
        set_password(pwd1)
        print("✓ Senha alterada com sucesso!")
        return True


def reset_password_interactive() -> bool:
    """Reseta a senha para o padrão."""
    print("\n" + "=" * 50)
    print("RESETAR SENHA - AÇÃO IRREVERSÍVEL")
    print("=" * 50)
    confirm = input("Digite 'RESETAR' para confirmar: ").strip()
    if confirm != "RESETAR":
        print("Operação cancelada.")
        return False
    
    if PASSWORD_FILE.exists():
        PASSWORD_FILE.unlink()
    print(f"Senha resetada para padrão: {DEFAULT_PASSWORD}")
    return True


def setup_initial_password():
    """Configura senha inicial se primeira execução."""
    if is_first_run():
        print("\n" + "=" * 50)
        print("   PRIMEIRA EXECUÇÃO - CONFIGURAÇÃO DE SENHA")
        print("=" * 50)
        print(f"Senha padrão: {DEFAULT_PASSWORD}")
        
        while True:
            new_pwd = getpass.getpass("Nova senha (Enter para manter padrão): ").strip()
            if not new_pwd:
                set_password(DEFAULT_PASSWORD)
                print(f"Senha padrão mantida: {DEFAULT_PASSWORD}")
                break
            confirm = getpass.getpass("Confirme a nova senha: ").strip()
            if new_pwd == confirm:
                set_password(new_pwd)
                print("✓ Senha configurada com sucesso")
                break
            print("✗ Senhas não coincidem. Tente novamente.")
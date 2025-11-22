import json
import pytest
import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from tools.debug_mqtt import load_config

@pytest.fixture
def mqtt_config_file(tmp_path):
    config_content = {
        "mqtt": {
            "broker": "localhost",
            "port": 1883,
            "username": "user",
            "password": "pass",
            "command_topic": "bms/ota/command",
            "status_topic": "bms/ota/status"
        }
    }
    config_file = tmp_path / "ota_deploy_config.json"
    with open(config_file, 'w') as f:
        json.dump(config_content, f)
    return str(config_file)

def test_load_config_success(mqtt_config_file):
    os.environ['CONFIG_PATH'] = mqtt_config_file
    config = load_config()
    assert config['broker'] == "localhost"
    assert config['port'] == 1883
    assert config['username'] == "user"
    assert config['password'] == "pass"
    assert config['command_topic'] == "bms/ota/command"
    assert config['status_topic'] == "bms/ota/status"

def test_load_config_file_not_found():
    os.environ['CONFIG_PATH'] = "non_existent_file.json"
    with pytest.raises(SystemExit) as pytest_wrapped_e:
        load_config()
    assert pytest_wrapped_e.type == SystemExit

def test_load_config_invalid_json(mqtt_config_file):
    with open(mqtt_config_file, 'w') as f:
        f.write("{ invalid_json }")
    with pytest.raises(SystemExit) as pytest_wrapped_e:
        load_config()
    assert pytest_wrapped_e.type == SystemExit
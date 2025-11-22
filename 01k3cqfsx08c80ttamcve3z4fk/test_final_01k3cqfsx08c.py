import pytest
import os
from tools.ota_deploy import OTADeployer

@pytest.fixture
def setup_version_file():
    version_file_path = 'version.txt'
    # Create a version.txt file for testing
    with open(version_file_path, 'w') as f:
        f.write("1.0.0")
    yield
    # Cleanup after test
    if os.path.exists(version_file_path):
        os.remove(version_file_path)

def test_version_file_cleanup(setup_version_file):
    deployer = OTADeployer()
    
    # Check if the version.txt file exists before cleanup
    assert os.path.exists('version.txt'), "version.txt should exist before cleanup"

    # Simulate the deployment process
    deployer.deploy()

    # Check if the version.txt file is removed after deployment
    assert not os.path.exists('version.txt'), "version.txt should be removed after deployment"

def test_version_file_creation():
    deployer = OTADeployer()
    
    # Ensure version.txt is not created if not needed
    deployer.create_version_file = False  # Simulate that the creation is disabled
    deployer.deploy()
    
    assert not os.path.exists('version.txt'), "version.txt should not be created if not needed"
echo '--- Disable Location-Based Suggestions for Siri'
if $(csrutil status | grep 'enabled'); then
    echo 'SIP must be disabled'
    exit 1
fi

original_file='/System/Library/LaunchAgents/com.apple.parsecd.plist'
backup_file="/Users/tst/aq.disabled"
if [ -f "$original_file" ]; then
    sudo launchctl unload -w "$original_file" 2> /dev/null
    if sudo mv "$original_file" "$backup_file"; then
        echo 'Disabled successfully'
    else
        >&2 echo 'Failed to disable'
    fi
else
    echo 'Already disabled'
fi
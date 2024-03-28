#!/usr/bin/env bash

main() {
  if is_linux; then
    echo 'Configuring Linux...'
    setup_warp_and_exclude_ipv6_on_linux
  elif is_macos; then
    echo 'Configuring macOS...'
    disable_ipv6_on_macos
  fi
  echo "IPv4: $(sudo curl -s4m8 --retry 3 -A Mozilla https://api.ip.sb/geoip)"
  echo "IPv6: $(sudo curl -s6m8 --retry 3 -A Mozilla https://api.ip.sb/geoip)"
}

is_linux() {
  [[ "$(uname -s)" == "Linux" ]]
}

is_macos() {
  [[ "$(uname -s)" == "Darwin" ]]
}

setup_warp_and_exclude_ipv6_on_linux() {
  curl -fsSL https://pkg.cloudflareclient.com/pubkey.gpg | sudo gpg --yes --dearmor --output /usr/share/keyrings/cloudflare-warp-archive-keyring.gpg
  echo "deb [arch=amd64 signed-by=/usr/share/keyrings/cloudflare-warp-archive-keyring.gpg] https://pkg.cloudflareclient.com/ $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/cloudflare-client.list
  sudo apt-get update
  sudo apt-get install -y cloudflare-warp
  sudo warp-cli --accept-tos registration new
  sudo warp-cli --accept-tos mode warp+doh # doh: DNS over HTTPS
  # sudo warp-cli --accept-tos add-excluded-route ::/0 # Exclude IPv6, forcing IPv4 resolution
  # interface=$(ip route show default | grep default | awk '{print $5}')
  # ipv6_interface_ip=$(ip addr show dev "$interface" | awk '/inet6 /{print $2}')
  sudo warp-cli --accept-tos tunnel ip add :: # Exclude IPv6, forcing IPv4 resolution
  sudo warp-cli --accept-tos connect
  # Other approaches considered:
  # - Prefer IPv4 in `/etc/gai.conf`: Requires proper configuration (just `precedence ::ffff:0:0/96  100`) is not enough.
  # - Using `sysctl` command: Results in Node 18 to exit with code `13`.
  # - Writing to `/proc/sys/net/`: Results in Node 18 to exit with code `13`.
  # - Writing to `/etc/sysctl.conf`: Results in Node 18 to exit with code `13`.
}

disable_ipv6_on_macos() {
  networksetup -listallnetworkservices \
    | tail -n +2 \
    | while IFS= read -r interface; do
        echo "Disabling IPv6 on: $interface"
        networksetup -setv6off "$interface"
      done
}

main

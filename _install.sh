git add .
git commit -m deploy
git pull origin master
git push origin master
sudo systemctl stop HrKillplus.service
sudo cp HrKillplus.service /etc/systemd/system/
sudo service systemd-resolved restart
sudo systemctl enable HrKillplus.service
sudo systemctl start HrKillplus.service
sudo systemctl status HrKillplus.service
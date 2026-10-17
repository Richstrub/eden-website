set -x
rm -rf out; mkdir -p out
python3 tmp/job1.py
ls out/bottles | wc -l

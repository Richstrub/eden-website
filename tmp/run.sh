set -x
rm -rf out; mkdir -p out
curl -s "https://qmblccwyxbpvziiwrlne.supabase.co/rest/v1/site_docs?select=path,data&path=like.site/*" -H "apikey: sb_publishable_Nbp1K_Co8tDVB-jNjBRs3w_D40qm4Mg" -o out/site-docs.json
ls -la out

set -x
rm -rf out; mkdir -p out
K=sb_publishable_Nbp1K_Co8tDVB-jNjBRs3w_D40qm4Mg
curl -sS "https://qmblccwyxbpvziiwrlne.supabase.co/rest/v1/site_docs?select=path,data,updated_at&path=like.site/*" -H "apikey: $K" -o out/site_docs.json
ls -la out
